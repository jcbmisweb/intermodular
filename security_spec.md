# Security Specification for IES Sostenible Gastronomic Project

## Data Invariants
1. **User Identity & Roles**: Any authenticated user can register in the database. Their role defaults to `pending` until assigned by an administrator.
2. **Classroom Assignments**: Users and projects must belong to a valid classroom to be visible to corresponding students.
3. **Project Teams**: Students can join a project within their assigned classroom. Once the team is closed, members cannot change, and tasks are unlocked.
4. **Grades & Evaluation**: Only authorized teachers or administrators can enter grades or modify assessment weight configurations.

## The "Dirty Dozen" Payloads (Denial Scenarios)
1. Unauthenticated write to `/users/john`
2. Spoofed role upgrade by self-assigning `role: "admin"` during registration
3. Creating a project in a classroom the user does not belong to
4. Modifying grades as an student
5. Deleting classroom settings by an student
6. Submitting peer evaluations for students outside of one's own project/classroom

## Security Verification (firestore.rules)
Rules are structured to mandate authentication (`request.auth != null`) for all collections, with granular restrictions preventing unauthenticated or malicious reads and writes, and ensuring clean data integrity for our educational environment.
