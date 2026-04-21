const OPENCV_SCRIPT_URL = "/vendor/opencv.js";

let cvPromise = null;

const hasReadyApi = (maybeCv) =>
  Boolean(
    maybeCv &&
      typeof maybeCv === "object" &&
      typeof maybeCv.matFromImageData === "function" &&
      typeof maybeCv.inpaint === "function",
  );

const resolveOpenCvInstance = async () => {
  const existing = self.cv;

  if (!existing) {
    throw new Error("OpenCV did not initialize");
  }

  if (typeof existing.then === "function") {
    const resolved = await existing;
    if (!hasReadyApi(resolved)) {
      throw new Error("OpenCV resolved without required APIs");
    }
    return resolved;
  }

  if (hasReadyApi(existing)) {
    return existing;
  }

  return new Promise((resolve, reject) => {
    const timeout = self.setTimeout(() => reject(new Error("OpenCV initialization timed out")), 45000);
    const previous = existing.onRuntimeInitialized;

    existing.onRuntimeInitialized = () => {
      self.clearTimeout(timeout);
      if (typeof previous === "function") {
        previous();
      }

      if (hasReadyApi(self.cv || existing)) {
        resolve(self.cv || existing);
        return;
      }

      reject(new Error("OpenCV initialized without required APIs"));
    };
  });
};

const loadOpenCv = async () => {
  if (!cvPromise) {
    cvPromise = (async () => {
      self.importScripts(OPENCV_SCRIPT_URL);
      return resolveOpenCvInstance();
    })();
  }

  return cvPromise;
};

const payloadToImageData = (payload) =>
  new ImageData(new Uint8ClampedArray(payload.buffer), payload.width, payload.height);

const matToImagePayload = (cv, mat) => {
  let outputMat = mat;
  let tempMat = null;

  try {
    if (typeof mat.channels === "function") {
      const channels = mat.channels();
      if (channels === 3) {
        tempMat = new cv.Mat();
        cv.cvtColor(mat, tempMat, cv.COLOR_RGB2RGBA);
        outputMat = tempMat;
      } else if (channels === 1) {
        tempMat = new cv.Mat();
        cv.cvtColor(mat, tempMat, cv.COLOR_GRAY2RGBA);
        outputMat = tempMat;
      }
    }

    const data = new Uint8ClampedArray(outputMat.data);
    return {
      width: outputMat.cols,
      height: outputMat.rows,
      buffer: data.buffer,
    };
  } finally {
    if (tempMat) {
      tempMat.delete();
    }
  }
};

self.onmessage = async (event) => {
  const { id, type, image, mask, options } = event.data;

  try {
    const cv = await loadOpenCv();

    if (type === "load") {
      self.postMessage({ id, type: "ready" });
      return;
    }

    if (type !== "inpaint") {
      throw new Error("Unsupported OpenCV worker request");
    }

    const sourceImageData = payloadToImageData(image);
    const maskImageData = payloadToImageData(mask);
    const sourceMat = cv.matFromImageData(sourceImageData);
    const maskRgba = cv.matFromImageData(maskImageData);
    const maskGray = new cv.Mat();
    const maskBinary = new cv.Mat();
    const dilatedMask = new cv.Mat();
    const destination = new cv.Mat();
    const kernel = new cv.Mat();

    try {
      cv.cvtColor(maskRgba, maskGray, cv.COLOR_RGBA2GRAY);
      cv.threshold(maskGray, maskBinary, 10, 255, cv.THRESH_BINARY);

      if (options.dilation > 0) {
        cv.dilate(maskBinary, dilatedMask, kernel, new cv.Point(-1, -1), options.dilation);
      } else {
        cv.threshold(maskGray, dilatedMask, 10, 255, cv.THRESH_BINARY);
      }

      cv.inpaint(
        sourceMat,
        dilatedMask,
        destination,
        options.radius,
        options.method === "ns" ? cv.INPAINT_NS : cv.INPAINT_TELEA,
      );

      const result = matToImagePayload(cv, destination);
      self.postMessage({ id, type: "result", image: result }, [result.buffer]);
    } finally {
      sourceMat.delete();
      maskRgba.delete();
      maskGray.delete();
      maskBinary.delete();
      dilatedMask.delete();
      destination.delete();
      kernel.delete();
    }
  } catch (error) {
    self.postMessage({
      id,
      type: "error",
      error: error instanceof Error ? error.message : "Unexpected OpenCV worker error",
    });
  }
};
