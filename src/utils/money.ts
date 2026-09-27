/**
 * Rounds a peso amount to centavos (2 decimals).
 * Use after summing or subtracting amounts, since JS floats
 * drift (e.g. 1000 - 120.35 - 89.9 = 789.7500000000001).
 */
export function roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}