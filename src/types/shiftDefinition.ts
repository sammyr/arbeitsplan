export interface ShiftDefinition {
    id: string;
    title: string;
    color?: string;
    excludeFromCalculations?: boolean;
    startTime?: string;
    endTime?: string;
}
