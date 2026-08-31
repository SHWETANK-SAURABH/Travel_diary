import { LocationForm } from "../LocationForm";

export default function NewLocationPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-h1">New location</h1>
      <LocationForm mode="create" />
    </div>
  );
}
