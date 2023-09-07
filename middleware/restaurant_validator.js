const { failure } = require("../util/common.js");
const HTTP_STATUS = require("../constants/status_codes.js");
const RESPONSE_MESSAGE = require("../constants/response_message");

const validateDish = (req, res, next) => {
  const { dishName, price } = JSON.parse(req.body);
  const errors = {};

  if (!dishName || typeof dishName !== "string" || dishName.trim() === "") {
    errors.dishName = "Dish name is required";
  }

  if (!price || typeof price !== "number" || price <= 0) {
    errors.price = "Valid Price is required";
  }

  if (Object.keys(errors).length > 0) {
    return failure(
      res,
      HTTP_STATUS.BAD_REQUEST,
      RESPONSE_MESSAGE.INVALID_DATA,
      errors
    );
  }

  next();
};

const validateQueryParams = (req, res, next) => {
  const {
    page,
    limit,
    filterOption,
    filter,
    sortOption,
    sort,
    search,
    menuPrice,
    priceComparison,
    menuSort,
  } = req.query;
  const errors = {};

  if (page) {
    if (isNaN(page) || page < 1) {
      errors.page = "Page must be a number greater than or equal to 1.";
    }
  }
  if (limit) {
    if (isNaN(limit) || limit < 1) {
      errors.limit = "Limit must be a number greater than or equal to 1.";
    }
  }

  if (filterOption) {
    if (!["cuisine", "menu", "location"].includes(filterOption)) {
      errors.filterOption = "Invalid filterOption value.";
    } else if (!filter) {
      errors.filter = "FilterOption exists, but filter is missing.";
    }
  }
  if (filter) {
    if (!filterOption) {
      errors.filterOption = "Filter exists, but filterOption is missing.";
    }
  }

  if (sortOption) {
    if (sortOption !== "deliveryFee") {
      errors.sortOption = "Invalid sortOption value.";
    } else if (!sort) {
      errors.sort = "SortOption exists, but sort is missing.";
    }
  }
  if (sort) {
    if (!sortOption) {
      errors.sortOption = "Sort exists, but sortOption is missing.";
    } else if (!["asc", "desc"].includes(sort)) {
      errors.sort = 'Invalid sort value (must be "asc" or "desc").';
    }
  }

  if (search && (typeof search !== "string" || search.trim() === "")) {
    errors.search = "Search must be a non-empty string.";
  }

  if (menuPrice) {
    if (isNaN(menuPrice)) {
      errors.menuPrice = "MenuPrice must be a number.";
    } else if (!priceComparison) {
      errors.priceComparison =
        "MenuPrice exists, but priceComparison is missing.";
    }
  }
  if (priceComparison) {
    if (!menuPrice) {
      errors.menuPrice = "PriceComparison exists, but menuPrice is missing.";
    } else if (!["greater", "less"].includes(priceComparison)) {
      errors.priceComparison =
        'Invalid priceComparison value (must be "greater" or "less").';
    }
  }

  if (menuSort && !["asc", "desc"].includes(menuSort)) {
    errors.menuSort = 'Invalid menuSort value (must be "asc" or "desc").';
  }

  if (Object.keys(errors).length > 0) {
    return failure(
      res,
      HTTP_STATUS.BAD_REQUEST,
      RESPONSE_MESSAGE.INVALID_DATA,
      errors
    );
  }

  next();
};

module.exports = {
  validateDish,
  validateQueryParams
};
