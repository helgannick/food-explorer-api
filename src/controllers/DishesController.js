const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const DiskStorage = require("../providers/DiskStorage");

class DishesController {
  async create(req, res) {
    const { title, description, category, price, ingredients } = req.body;

    const checkDisheAlreadyExists = await knex("dishes")
      .where({ title })
      .first();

    if (checkDisheAlreadyExists) {
      throw new AppError("Este prato já existe no cardápio.");
    }

    const imageFileName = req.file.filename;

    const diskStorage = new DiskStorage();

    const filename = await diskStorage.saveFile(imageFileName);

    const [dishe_id] = await knex("dishes").insert({
      image: filename,
      title,
      description,
      price,
      category,
    });

    const hasOnlyOneIngredient = typeof ingredients === "string";

    let ingredientsInsert;

    if (typeof ingredients === "string") {
      ingredientsInsert = [
        {
          name: ingredients,
          dishe_id,
        },
      ];
    } else if (Array.isArray(ingredients) && ingredients.length > 0) {
      ingredientsInsert = ingredients.map((name) => ({
        name,
        dishe_id,
      }));
    }

    await knex("ingredients").insert(ingredientsInsert);

    return res.status(201).json();
  }

  async show(req, res) {
    const { id } = req.params;
    const dishe = await knex("dishe").where({ id }).first();
    const ingredients = await knex("ingredients")
      .where({ dishe_id: id })
      .orderBy("name");

    return res.status(201).json({
      ...dishe,
      ingredients,
    });
  }

  async update(req, res) {
    const { title, description, category, price, ingredients, image } =
      req.body;
    const { id } = req.params;

    const imageFileName = req.file.filename;

    const diskStorage = new DiskStorage();

    const dishe = await knex("dishe").where({ id }).first();

    if (dishe.image) {
      await diskStorage.deleteFile(dishe.image);
    }

    const filename = await diskStorage.saveFile(imageFileName);

    dishe.image = image ?? filename;
    dishe.title = title ?? dishe.title;
    dishe.description = description ?? dishe.description;
    dishe.category = category ?? dishe.category;
    dishe.price = price ?? dishe.price;

    await knex("dishes").where({ id }).update(dishe);

    const hasOnlyOneIngredient = typeof ingredients === "string";

    let ingredientsInsert;

    if (hasOnlyOneIngredient) {
      ingredientsInsert = {
        name: ingredients,
        dishe_id: dishe.id,
      };
    } else if (ingredients.length > 1) {
      ingredientsInsert = ingredients.map((ingredient) => {
        return {
          dishe_id: dishe.id,
          name: ingredient,
        };
      });
    }

    await knex("ingredients").where({ dishe_id: id }).delete();
    await knex("ingredients").where({ dishe_id: id }).insert(ingredientsInsert);

    return res.status(201).json("Prato atualizado com sucesso");
  }

  async delete(req, res) {
    const { id } = req.params;

    await knex("dishes").where({ id }).delete();

    return res.status(202).json();
  }

  async index(req, res) {
    const { title, ingredients } = req.query;

    let dishes;

    if (ingredients) {
      const filterIngredients = ingredients
        .split(",")
        .map((ingredient) => ingredient.trim());

      dishes = await knex("ingredients")
        .select([
          "dishes.image",
          "dishes.id",
          "dishes.title",
          "dishes.description",
          "dishes.category",
          "dishes.price",
        ])
        .whereLike("dishes.title", `%${title}%`)
        .whereIn("name", filterIngredients)
        .innerJoin("dishes", "dishes.id", "ingredients.dishe_id")
        .groupBy("dishes.id")
        .orderBy("dishes.title");
    } else {
      dishes = await knex("dishes")
        .whereLike("title", `%${title}%`)
        .orderBy("title");
    }

    const dishesIngredients = await knex("ingredients");
    const dishesWithIngredients = dishes.map((dishe) => {
      const disheIngredient = dishesIngredients.filter(
        (ingredient) => ingredient.dishe_id === dishe.id
      );

      return {
        ...dishe,
        ingredients: disheIngredient,
      };
    });

    return res.status(200).json(dishesWithIngredients);
  }
}

module.exports = DishesController;
