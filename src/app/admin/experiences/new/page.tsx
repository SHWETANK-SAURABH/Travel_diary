import { ExperienceForm } from "../ExperienceForm";

export default function NewExperiencePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-h1">New experience</h1>
      <ExperienceForm mode="create" />
    </div>
  );
}
