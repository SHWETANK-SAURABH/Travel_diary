import { FoodForm } from "../FoodForm";

export default function NewFoodPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-h1">New food item</h1>
      <FoodForm mode="create" />
    </div>
  );
}
