import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Download, RefreshCw, Upload } from "@/components/icons";

import ToolHero from "@/components/ToolHero";
import { AdSlot } from "@/components/ads/AdSlot";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

const OUTPUT_FORMATS = [
  { value: "jpg", label: "JPG", mime: "image/jpeg" },
  { value: "png", label: "PNG", mime: "image/png" },
  { value: "webp", label: "WEBP", mime: "image/webp" },
] as const;

const CONVERT_COPY = {
  en: {
    heroDescription: "Convert common raster images to JPG, PNG, or WEBP directly in the browser.",
    uploadTitle: "Upload image",
    uploadDescription:
      "This tool is intended for browser-friendly raster formats. PDF and advanced vector conversion are not currently offered here.",
    dropIdle: "Drag and drop an image here, or click to select.",
    dropActive: "Drop the image here.",
    fileHint: "PNG, JPG, WEBP, GIF, BMP, or SVG up to 20 MB.",
    originalAlt: "Original preview",
    formatLabel: "Export format",
    formatPlaceholder: "Select output format",
    convertAction: "Convert image",
    resultTitle: "Result",
    resultDescription: "Preview the exported file before downloading it.",
    resultAlt: "Converted preview",
    emptyResult: "Upload a file and convert it to review the result here.",
    errors: {
      canvasUnavailable: "Canvas 2D context is not available in this browser.",
      generateFailed: "Unable to generate the converted file.",
      decodeFailed: "The selected file could not be decoded in this browser.",
      genericFailed: "The image could not be converted with the selected output format.",
    },
  },
  pt: {
    heroDescription: "Converta imagens raster comuns para JPG, PNG ou WEBP diretamente no navegador.",
    uploadTitle: "Enviar imagem",
    uploadDescription:
      "Esta ferramenta é voltada para formatos raster compatíveis com navegador. Conversão de PDF e vetores avançados não está disponível aqui no momento.",
    dropIdle: "Arraste uma imagem até aqui ou clique para selecionar.",
    dropActive: "Solte a imagem aqui.",
    fileHint: "PNG, JPG, WEBP, GIF, BMP ou SVG de até 20 MB.",
    originalAlt: "Pré-visualização original",
    formatLabel: "Formato de saída",
    formatPlaceholder: "Selecione o formato de saída",
    convertAction: "Converter imagem",
    resultTitle: "Resultado",
    resultDescription: "Visualize o arquivo exportado antes de baixá-lo.",
    resultAlt: "Pré-visualização convertida",
    emptyResult: "Envie um arquivo e converta-o para revisar o resultado aqui.",
    errors: {
      canvasUnavailable: "O contexto 2D do canvas não está disponível neste navegador.",
      generateFailed: "Não foi possível gerar o arquivo convertido.",
      decodeFailed: "O arquivo selecionado não pôde ser decodificado neste navegador.",
      genericFailed: "Não foi possível converter a imagem com o formato de saída escolhido.",
    },
  },
  es: {
    heroDescription: "Convierte imágenes raster comunes a JPG, PNG o WEBP directamente en el navegador.",
    uploadTitle: "Subir imagen",
    uploadDescription:
      "Esta herramienta está pensada para formatos raster compatibles con el navegador. La conversión de PDF y vectores avanzados no está disponible aquí por ahora.",
    dropIdle: "Arrastra una imagen hasta aquí o haz clic para seleccionarla.",
    dropActive: "Suelta la imagen aquí.",
    fileHint: "PNG, JPG, WEBP, GIF, BMP o SVG de hasta 20 MB.",
    originalAlt: "Vista previa original",
    formatLabel: "Formato de salida",
    formatPlaceholder: "Selecciona el formato de salida",
    convertAction: "Convertir imagen",
    resultTitle: "Resultado",
    resultDescription: "Previsualiza el archivo exportado antes de descargarlo.",
    resultAlt: "Vista previa convertida",
    emptyResult: "Sube un archivo y conviértelo para revisar aquí el resultado.",
    errors: {
      canvasUnavailable: "El contexto 2D del canvas no está disponible en este navegador.",
      generateFailed: "No se pudo generar el archivo convertido.",
      decodeFailed: "El archivo seleccionado no pudo decodificarse en este navegador.",
      genericFailed: "No se pudo convertir la imagen con el formato de salida seleccionado.",
    },
  },
} as const;

const ConvertPage = () => {
  const { language, t } = useLanguage();
  const copy = CONVERT_COPY[language];
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [outputFormat, setOutputFormat] = useState<(typeof OUTPUT_FORMATS)[number]["value"]>("png");
  const [convertedImageUrl, setConvertedImageUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      if (convertedImageUrl) {
        URL.revokeObjectURL(convertedImageUrl);
      }
    };
  }, [convertedImageUrl, imageUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);

    setImage(file);
    setImageUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return objectUrl;
    });
    setConvertedImageUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return "";
    });
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif", ".svg"],
    },
    multiple: false,
    maxSize: 20 * 1024 * 1024,
  });

  const convertImage = async () => {
    if (!image || !imageUrl) return;

    setIsProcessing(true);
    setError(null);

    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error(copy.errors.canvasUnavailable);
      }

      const selectedFormat = OUTPUT_FORMATS.find((format) => format.value === outputFormat) ?? OUTPUT_FORMATS[1];

      const convertedBlob = await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;

          if (selectedFormat.value === "jpg") {
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);
          }

          context.drawImage(img, 0, 0);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error(copy.errors.generateFailed));
              }
            },
            selectedFormat.mime,
            0.92,
          );
        };
        img.onerror = () => reject(new Error(copy.errors.decodeFailed));
        img.src = imageUrl;
      });

      const outputUrl = URL.createObjectURL(convertedBlob);
      setConvertedImageUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return outputUrl;
      });
    } catch (conversionError) {
      console.error("Error converting image:", conversionError);
      setError(conversionError instanceof Error ? conversionError.message : copy.errors.genericFailed);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!convertedImageUrl) return;

    const link = document.createElement("a");
    link.href = convertedImageUrl;
    link.download = `converted-${Date.now()}.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container space-y-8 py-12">
      <ToolHero
        pageId="convert"
        icon={<RefreshCw className="h-6 w-6 text-white" />}
        title={t("tools.convert.title")}
        description={copy.heroDescription}
        badgeClassName="bg-gradient-to-br from-green-500 to-emerald-500"
      />

      <AdSlot slot="convert-top-placement" className="h-24" />

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{copy.uploadTitle}</CardTitle>
            <CardDescription>{copy.uploadDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{isDragActive ? copy.dropActive : copy.dropIdle}</p>
                <p className="text-xs text-muted-foreground">{copy.fileHint}</p>
              </div>
            </div>

            {imageUrl ? (
              <div className="space-y-3">
                <img
                  src={imageUrl}
                  alt={copy.originalAlt}
                  className="w-full rounded-lg border"
                  style={{ maxHeight: "220px", objectFit: "contain" }}
                />
                <p className="text-center text-xs text-muted-foreground">{image?.name}</p>
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm font-medium">{copy.formatLabel}</label>
              <Select value={outputFormat} onValueChange={(value) => setOutputFormat(value as typeof outputFormat)}>
                <SelectTrigger>
                  <SelectValue placeholder={copy.formatPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {OUTPUT_FORMATS.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={convertImage}
              disabled={!image || isProcessing}
              className="w-full bg-gradient-primary text-primary-foreground"
            >
              {isProcessing ? t("common.processing") : copy.convertAction}
            </Button>

            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{copy.resultTitle}</CardTitle>
            <CardDescription>{copy.resultDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            {convertedImageUrl ? (
              <div className="space-y-4">
                <img
                  src={convertedImageUrl}
                  alt={copy.resultAlt}
                  className="w-full rounded-lg border"
                  style={{ maxHeight: "220px", objectFit: "contain" }}
                />
                <Button onClick={downloadImage} className="w-full bg-gradient-success text-success-foreground">
                  <Download className="mr-2 h-4 w-4" />
                  {t("common.download")} {outputFormat.toUpperCase()}
                </Button>
              </div>
            ) : (
              <div className="py-16 text-center text-muted-foreground">
                <RefreshCw className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>{copy.emptyResult}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConvertPage;
