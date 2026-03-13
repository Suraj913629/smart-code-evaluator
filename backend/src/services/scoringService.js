const calculateScore = (metrics, parameters, weightage) => {
  const violations = [], suggestions = [];
  let totalPenalty = 0;
  const weights = { complexity: weightage?.complexity || 40, codeLength: weightage?.codeLength || 20, comments: weightage?.comments || 15, duplication: weightage?.duplication || 25 };
  const weightSum = Object.values(weights).reduce((a, b) => a + b, 0);
  const nw = {};
  for (const k of Object.keys(weights)) nw[k] = (weights[k] / weightSum) * 100;

  if (metrics.complexity > parameters.maxComplexity) {
    const r = (metrics.complexity - parameters.maxComplexity) / parameters.maxComplexity;
    totalPenalty += Math.min(nw.complexity, nw.complexity * (1 + r));
    violations.push({ metric: 'Cyclomatic Complexity', severity: r > 1 ? 'Critical' : r > 0.5 ? 'Major' : 'Minor', message: `Complexity (${metrics.complexity}) exceeds limit (${parameters.maxComplexity})`, actual: metrics.complexity, limit: parameters.maxComplexity });
    suggestions.push('Reduce complexity by breaking large functions into smaller ones.');
  }
  if (metrics.loc > parameters.maxLOC) {
    const r = (metrics.loc - parameters.maxLOC) / parameters.maxLOC;
    totalPenalty += Math.min(nw.codeLength, nw.codeLength * (1 + r));
    violations.push({ metric: 'Lines of Code', severity: r > 1 ? 'Critical' : r > 0.5 ? 'Major' : 'Minor', message: `Code length (${metrics.loc} lines) exceeds limit (${parameters.maxLOC} lines)`, actual: metrics.loc, limit: parameters.maxLOC });
    suggestions.push('Reduce code length by eliminating redundant code.');
  }
  if (metrics.commentDensity < parameters.minCommentDensity) {
    const r = (parameters.minCommentDensity - metrics.commentDensity) / parameters.minCommentDensity;
    totalPenalty += nw.comments * r;
    violations.push({ metric: 'Comment Density', severity: r > 0.7 ? 'Major' : 'Minor', message: `Comment density (${metrics.commentDensity}%) below minimum (${parameters.minCommentDensity}%)`, actual: metrics.commentDensity, limit: parameters.minCommentDensity });
    suggestions.push('Add more comments to explain your logic.');
  }
  if (metrics.duplication > parameters.maxDuplication) {
    const r = (metrics.duplication - parameters.maxDuplication) / parameters.maxDuplication;
    totalPenalty += Math.min(nw.duplication, nw.duplication * (1 + r));
    violations.push({ metric: 'Code Duplication', severity: r > 1 ? 'Critical' : 'Major', message: `Duplication (${metrics.duplication}%) exceeds limit (${parameters.maxDuplication}%)`, actual: metrics.duplication, limit: parameters.maxDuplication });
    suggestions.push('Remove duplicate code by creating reusable functions.');
  }
  if (metrics.functionLength > parameters.maxFunctionLength) {
    const r = (metrics.functionLength - parameters.maxFunctionLength) / parameters.maxFunctionLength;
    totalPenalty += 5 * r;
    violations.push({ metric: 'Function Length', severity: r > 1 ? 'Major' : 'Minor', message: `Function length (${metrics.functionLength} lines) exceeds limit (${parameters.maxFunctionLength} lines)`, actual: metrics.functionLength, limit: parameters.maxFunctionLength });
    suggestions.push('Break long functions into smaller helper functions.');
  }
  if (metrics.ifElseDepth > parameters.maxIfElseDepth) {
    const r = (metrics.ifElseDepth - parameters.maxIfElseDepth) / parameters.maxIfElseDepth;
    totalPenalty += 5 * r;
    violations.push({ metric: 'If/Else Nesting Depth', severity: r > 1 ? 'Major' : 'Minor', message: `Nesting depth (${metrics.ifElseDepth}) exceeds limit (${parameters.maxIfElseDepth})`, actual: metrics.ifElseDepth, limit: parameters.maxIfElseDepth });
    suggestions.push('Reduce nesting by using early returns or guard clauses.');
  }
  if (metrics.loops > parameters.maxLoops) {
    totalPenalty += 3;
    violations.push({ metric: 'Number of Loops', severity: 'Minor', message: `Loop count (${metrics.loops}) exceeds limit (${parameters.maxLoops})`, actual: metrics.loops, limit: parameters.maxLoops });
    suggestions.push('Consider replacing loops with array methods like map, filter, reduce.');
  }
  if (violations.length === 0) suggestions.push('Excellent! Your code meets all quality standards.');
  const score = Math.max(0, Math.round(100 - totalPenalty));
  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 45 ? 'D' : 'F';
  return { score, grade, violations, suggestions };
};

module.exports = { calculateScore };