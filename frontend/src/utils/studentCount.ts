// src/utils/studentCount.ts

export const STUDENT_COUNT_UPDATED_EVENT = "campusHub_studentCountUpdated";

/**
 * Dispatches a custom event when the total student count updates.
 */
export function notifyStudentCountUpdate(count: number): void {
  window.dispatchEvent(
    new CustomEvent(STUDENT_COUNT_UPDATED_EVENT, { detail: { count } })
  );
}