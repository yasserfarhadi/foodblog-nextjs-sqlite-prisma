import fs from 'node:fs';
import sql from 'better-sqlite3';
import slugify from 'slugify';
import xss from 'xss';

const db = sql('meals.db');

export async function getMeals() {
  await new Promise((r) => setTimeout(r, 2000));

  // throw new Error('Loading meals failed!');

  return db.prepare('SELECT * FROM meals').all();
}

export async function getMeal(id: string) {
  await new Promise((r) => setTimeout(r, 2000));
  return db
    .prepare('SELECT * FROM meals WHERE slug = ?')
    .get(id) as Meal<string> | null;
}

export async function saveMeal(meal: Omit<Meal<File>, 'id' | 'slug'>) {
  const finalMeal: Partial<Meal<string>> = { ...meal, image: '' };
  const instructions = xss(meal.instructions);
  finalMeal.slug = slugify(meal.title, { lower: true });
  finalMeal.instructions = instructions;

  const extention = meal.image?.name?.split('.').pop();
  const fileName = `${finalMeal.slug}.${extention}`;
  const stream = fs.createWriteStream(`public/images/${fileName}`);
  const bufferedImage = await meal.image.arrayBuffer();
  stream.write(Buffer.from(bufferedImage), (error) => {
    if (error) throw new Error('Saving image failed!');
  });
  finalMeal.image = `/images/${fileName}`;

  db.prepare(
    `
    INSERT INTO meals
      (title, summary, instructions, creator, creator_email, image, slug)
      VALUES (
        @title,
        @summary,
        @instructions,
        @creator,
        @creator_email,
        @image,
        @slug
      )
  `
  ).run(finalMeal);
}
