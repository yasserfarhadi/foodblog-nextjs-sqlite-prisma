'use server';

import { revalidatePath } from 'next/cache';
import { saveMeal } from './meals';
import { redirect } from 'next/navigation';

function isInvalidText(text: string) {
  return !text || text.trim() === '';
}

export async function shareMeal(
  initialState: { message: string } | null,
  formData: FormData
) {
  if (!formData)
    return {
      message: 'No Input',
    };
  const meal: Omit<Meal<File>, 'id' | 'slug'> = {
    title: formData.get('title') as string,
    summary: formData.get('summary') as string,
    instructions: formData.get('instructions') as string,
    image: formData.get('image') as File,
    creator: formData.get('name') as string,
    creator_email: formData.get('email') as string,
  };

  if (
    isInvalidText(meal.title) ||
    isInvalidText(meal.summary) ||
    isInvalidText(meal.instructions) ||
    isInvalidText(meal.creator) ||
    isInvalidText(meal.creator_email) ||
    !meal.creator_email.includes('@') ||
    !meal.image ||
    meal.image.size === 0
  ) {
    return { message: 'Invalid Input' };
  }
  await saveMeal(meal);
  revalidatePath('/meals');
  redirect('/meals');
}
