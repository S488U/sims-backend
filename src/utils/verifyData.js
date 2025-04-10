export const verifyData = (data) => {
  const validationRules = {
    name: {
      regex: /^[a-zA-Z ]{3,50}$/,
      message: "Name must contain only letters & spaces (3-50 characters)",
    },
    email: {
      regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "Invalid email format",
    },
    phone: {
      regex: /^[0-9]{10}$/,
      message: "Phone number must be 10 digits",
    },
    password: {
      regex: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@#$%^&*!?])[A-Za-z\d@#$%^&*!?]{8,}$/,
      message: "Password must be at least 8 characters, include a number and a special character",
    },
    categoryName: {
      regex: /^[a-z ]+$/,
      message: "Category must be lowercased and don't support special characters"
    },
    description: {
      regex: /^[a-zA-Z ]{3,150}$/,
      message: "Description must contain only letters & spaces (3-150 characters)",
      optional: true,
    },
    pricePerItem: {
      regex: /^[0-9]+(\.[0-9]{1,2})?$/,
      message: "Price must be a number with up to 2 decimal places",
    },
    price: {
      regex: /^[0-9]+(\.[0-9]{1,2})?$/,
      message: "Price must be a number with up to 2 decimal places",
    }
  };

  if (Object.keys(data).length === 0) {
    return { success: false, message: "No data provided for the validation" };
  }

  for (const [field, value] of Object.entries(data)) {
    if (!value && !validationRules[field]?.optional) {
      return { success: false, message: `${field} is required` };
    }

    if (validationRules[field] && !validationRules[field].regex.test(String(value))) {
      return { success: false, message: validationRules[field].message };
    }
  }

  return { success: true };
};


// console.log(verifyData({price: 10, pricePerItem: "dfd", name : " Shahabas ", price: "30"}));
