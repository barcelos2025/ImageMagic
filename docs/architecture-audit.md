# Auditoria Técnica do ImageMagic

## Estado atual da base

### Rotas e páginas

- Home: `src/pages/Index.tsx`
- Redimensionamento: `src/pages/ResizePage.tsx`
- Conversão: `src/pages/ConvertPage.tsx`
- Remoção de fundo: `src/pages/RemoveBackgroundPage.tsx`
- Borracha mágica: `src/pages/MagicBrushPage.tsx`
- Upscale: `src/pages/resize-upscale.tsx` e `src/pages/ResizeUpscalePage.tsx`
- Corte inteligente: `src/pages/SmartCropPage.tsx`
- Rotas globais: `src/App.tsx`

### Estrutura de layout e shell global

- Layout global: `src/components/layout/Layout.tsx`
- Cabeçalho e rodapé: `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`
- SEO por rota: `src/components/seo/DefaultSEO.tsx`, `src/components/seo/RouteSeo.tsx`
- Contextos globais: `src/contexts/LanguageContext.tsx`, `src/contexts/ThemeContext.tsx`

### Padrões existentes antes da refatoração

- Upload local repetido por página com `react-dropzone`
- Criação manual de `objectURL` em múltiplas ferramentas
- Preview de resultado já compartilhado em `src/components/ResultImagePreview.tsx`
- Exportação por `anchor.click()` repetida em várias páginas
- Processamento local misturado com UI dentro de cada página
- Pouca padronização para presets, fila, histórico e jobs assíncronos

## Problemas arquiteturais encontrados

1. Acoplamento alto entre UI e processamento nas páginas de ferramenta.
2. Duplicação de upload, preview, exportação e tratamento de `objectURL`.
3. Histórico de ações inexistente ou local demais em quase todas as ferramentas.
4. Jobs pesados sem contrato comum de progresso e estado.
5. Base preparada para poucas ferramentas, mas sem uma camada única para expansão.

## Base técnica implementada

### Camada de domínio

- Tipos centrais: `src/domain/editor/types.ts`
- Registro de ferramentas: `src/domain/editor/toolRegistry.ts`
- Barrel do domínio: `src/domain/editor/index.ts`

Isso estabelece:

- categoria da ferramenta
- runtime client/server
- status da ferramenta
- suporte a lote
- formatos de exportação
- contrato base para operações de imagem

### Engine central de imagem

- `src/lib/image-engine/client.ts`
- `src/lib/image-engine/index.ts`

Responsabilidades centralizadas:

- formatos de entrada aceitos
- criação de canvas
- contexto 2D com erro consistente
- leitura de imagem
- detecção de suporte de MIME
- encode para PNG/JPG/WEBP/AVIF/BMP
- crop para canvas
- render para canvas
- download de blob

### Componentes reutilizáveis do editor

- `src/components/editor/EditorShell.tsx`
- `src/components/editor/UploadArea.tsx`
- `src/components/editor/ImageCanvasPreview.tsx`
- `src/components/editor/BeforeAfterSlider.tsx`
- `src/components/editor/ToolSidebar.tsx`
- `src/components/editor/ExportPanel.tsx`
- `src/components/editor/ExportControls.tsx`
- `src/components/editor/PresetSelector.tsx`
- `src/components/editor/BatchQueuePanel.tsx`
- `src/components/editor/EditorToolbar.tsx`
- `src/components/editor/index.ts`

Esses blocos agora cobrem o shell visual padrão das ferramentas e reduzem a repetição de UI.

### Hooks reutilizáveis

- Arquivos: `src/hooks/editor/useEditorFiles.ts`
- Preview: `src/hooks/editor/useEditorPreview.ts`
- Exportação: `src/hooks/editor/useEditorExport.ts`
- Presets locais: `src/hooks/editor/useEditorPresets.ts`
- Jobs: `src/hooks/editor/useEditorJobs.ts`
- Processamento pesado: `src/hooks/editor/useEditorProcessing.ts`
- Notificações: `src/hooks/editor/useEditorNotifications.ts`
- Estado central com undo/redo: `src/hooks/editor/useEditorState.ts`
- Barrel: `src/hooks/editor/index.ts`

### Estado central do editor

`useEditorState` agora entrega:

- `settings`
- `syncSettings`
- `updateSettings`
- `replaceSettings`
- `undo`
- `redo`
- `batchQueue`

Também foi reforçado para evitar estado obsoleto em atualizações rápidas e limitar o histórico em memória.

## Integração inicial feita na base atual

### Páginas já migradas para a infraestrutura nova

- `src/pages/ConvertPage.tsx`
- `src/pages/SmartCropPage.tsx`

Essas páginas já usam a base comum para:

- upload
- preview
- presets
- exportação
- jobs
- notificações
- histórico local
- shell visual padronizado

### Compatibilidade preservada

- `ResizePage.tsx`, `RemoveBackgroundPage.tsx`, `MagicBrushPage.tsx` e `resize-upscale.tsx` continuam funcionando sem mudança estrutural forçada.
- O preview ampliado por clique permanece centralizado em `ResultImagePreview`.
- O aviso de processamento local continua compartilhado em `LocalProcessingNotice`.

## O que ainda existe fora da base nova

As páginas abaixo ainda carregam lógica própria de editor e são candidatas naturais para a próxima migração:

- `src/pages/ResizePage.tsx`
- `src/pages/RemoveBackgroundPage.tsx`
- `src/pages/MagicBrushPage.tsx`
- `src/pages/resize-upscale.tsx`

Principais pontos ainda não consolidados nelas:

- `useDropzone` direto na página
- `URL.createObjectURL` direto na página
- exportação manual
- estado de progresso local sem contrato comum
- configurações e presets sem estado central

## Arquitetura proposta para expansão segura

### Fluxo alvo

1. Página da ferramenta define apenas a intenção e os controles específicos.
2. `EditorShell` organiza o layout.
3. Hooks do editor gerenciam upload, preview, presets, jobs e exportação.
4. Engine central executa operações client-side.
5. Operações server-side futuras usam o mesmo contrato do domínio.

### Regras práticas para próximas ferramentas

- Toda nova ferramenta deve registrar seu metadado em `toolRegistry`.
- Toda operação visual deve reaproveitar `EditorShell`, `ToolSidebar` e `ExportPanel`.
- Toda entrada de arquivo deve usar `useEditorFiles`.
- Toda geração de preview deve usar `useEditorPreview`.
- Toda exportação deve usar `useEditorExport`.
- Toda tarefa longa deve usar `useEditorProcessing` ou `useEditorJobs`.
- Presets persistidos localmente devem usar `useEditorPresets`.

## Próximas migrações recomendadas

1. Migrar `ResizePage.tsx` para a base nova.
2. Migrar `RemoveBackgroundPage.tsx` para usar `useEditorProcessing`.
3. Adaptar `MagicBrushPage.tsx` para reaproveitar `BatchQueuePanel`.
4. Unificar upscale em cima da engine central e do shell comum.
5. Extrair contratos de operação por ferramenta para um diretório `src/domain/editor/operations/`.

## Validação

- Build: `npm.cmd run build` OK
- Lint: `npm.cmd run lint` OK, apenas warnings existentes de fast-refresh em componentes UI compartilhados

## Limpeza segura pendente

Ainda não foi feita limpeza agressiva porque existem mudanças funcionais em andamento e algumas páginas antigas ainda não foram migradas. O próximo passo seguro é:

1. concluir a migração de `ResizePage`, `RemoveBackgroundPage`, `MagicBrushPage` e `resize-upscale`
2. identificar utilitários duplicados após a migração
3. remover apenas o que ficar comprovadamente sem uso
