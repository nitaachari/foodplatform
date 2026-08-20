const categoryService = require("../services/category.service");

// Create Category

const createCategory = async (req, res) => {
    try {
        const category = await categoryService.createCategory(req.body, req.user._id);

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            category
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get Categories of a Restaurant

const getCategoriesByRestaurant = async (req, res) => {
    try {
        const categories = await categoryService.getCategoriesByRestaurant(
            req.params.restaurantId
        );

        res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Update Category

const updateCategory = async (req, res) => {
    try {
        const category = await categoryService.updateCategory(
            req.params.id,
            req.user._id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete Category

const deleteCategory = async (req, res) => {
    try {
        await categoryService.deleteCategory(
            req.params.id,
            req.user._id
        );

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createCategory,
    getCategoriesByRestaurant,
    updateCategory,
    deleteCategory
};
