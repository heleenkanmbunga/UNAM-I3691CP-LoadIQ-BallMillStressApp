// mlPredictor.js
// On-device Machine Learning: Linear Regression Stress Predictor
// Trains on the user's historical calculation data to predict stress outcomes
// Load IQ | UNAM I3691CP | Semester 1, 2026

export function trainModel(records) {
  // We use multiple linear regression: stress = w0 + w1*load + w2*area
  // Using least squares gradient descent
  if (!records || records.length < 2) {
    return null;
  }

  const data = records.map(r => ({
    load: parseFloat(r.load),
    area: parseFloat(r.area),
    stress: parseFloat(r.stress),
  })).filter(r => !isNaN(r.load) && !isNaN(r.area) && !isNaN(r.stress));

  if (data.length < 2) return null;

  const n = data.length;

  // Normalize inputs
  const maxLoad = Math.max(...data.map(d => d.load));
  const maxArea = Math.max(...data.map(d => d.area));
  const maxStress = Math.max(...data.map(d => d.stress));

  const normalized = data.map(d => ({
    load: d.load / maxLoad,
    area: d.area / maxArea,
    stress: d.stress / maxStress,
  }));

  // Gradient descent
  let w0 = 0, w1 = 0.5, w2 = 0.5;
  const lr = 0.01;
  const epochs = 1000;

  for (let e = 0; e < epochs; e++) {
    let dw0 = 0, dw1 = 0, dw2 = 0;
    for (const d of normalized) {
      const pred = w0 + w1 * d.load + w2 * d.area;
      const err = pred - d.stress;
      dw0 += err;
      dw1 += err * d.load;
      dw2 += err * d.area;
    }
    w0 -= (lr / n) * dw0;
    w1 -= (lr / n) * dw1;
    w2 -= (lr / n) * dw2;
  }

  return { w0, w1, w2, maxLoad, maxArea, maxStress };
}

export function predict(model, load, area) {
  if (!model) return null;

  const normLoad = load / model.maxLoad;
  const normArea = area / model.maxArea;
  const normStress = model.w0 + model.w1 * normLoad + model.w2 * normArea;
  const predictedStress = normStress * model.maxStress;

  // Confidence based on how well inputs are within training range
  const loadConfidence = Math.min(load / model.maxLoad, 1) * 100;
  const areaConfidence = Math.min(area / model.maxArea, 1) * 100;
  const confidence = Math.round((loadConfidence + areaConfidence) / 2);

  return {
    predictedStress: Math.max(0, predictedStress),
    confidence: Math.min(confidence, 95),
  };
}

export function getPredictionStatus(predictedStress, material, MATERIALS) {
  const mat = MATERIALS[material];
  if (!mat) return null;
  if (predictedStress < mat.warningThreshold) {
    return { status: 'SAFE', color: '#4CAF50' };
  } else if (predictedStress < mat.yieldStrength) {
    return { status: 'WARNING', color: '#FF9800' };
  } else {
    return { status: 'CRITICAL', color: '#F44336' };
  }
}