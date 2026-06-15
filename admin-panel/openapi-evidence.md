### /auth/login
`json
{
  "post": {
    "description": "Authenticate user with email or phone and password. Returns JWT tokens.",
    "operationId": "AuthController_login",
    "parameters": [],
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/LoginDto"
          }
        }
      }
    },
    "responses": {
      "200": {
        "description": "Successfully authenticated."
      },
      "401": {
        "description": "Invalid credentials."
      }
    },
    "summary": "Login",
    "tags": [
      "Auth"
    ]
  }
}
`

### /products
`json
{
  "post": {
    "operationId": "ProductController_createProduct",
    "parameters": [],
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/CreateProductDto"
          }
        }
      }
    },
    "responses": {
      "201": {
        "description": ""
      }
    },
    "security": [
      {
        "bearer": []
      }
    ],
    "summary": "Create Product",
    "tags": [
      "Product"
    ]
  },
  "get": {
    "operationId": "ProductController_getProducts",
    "parameters": [
      {
        "name": "page",
        "required": false,
        "in": "query",
        "description": "Page",
        "schema": {
          "type": "number"
        }
      },
      {
        "name": "limit",
        "required": false,
        "in": "query",
        "description": "Limit",
        "schema": {
          "type": "number"
        }
      },
      {
        "name": "search",
        "required": false,
        "in": "query",
        "description": "Search",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "sortBy",
        "required": false,
        "in": "query",
        "description": "SortBy",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "sortOrder",
        "required": false,
        "in": "query",
        "description": "SortOrder",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "startDate",
        "required": false,
        "in": "query",
        "description": "StartDate",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "endDate",
        "required": false,
        "in": "query",
        "description": "EndDate",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "status",
        "required": false,
        "in": "query",
        "description": "Status",
        "schema": {
          "type": "string"
        }
      }
    ],
    "responses": {
      "200": {
        "description": "",
        "content": {
          "application/json": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/components/schemas/PaginatedDto"
                },
                {
                  "properties": {
                    "data": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Product"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    },
    "security": [
      {
        "bearer": []
      }
    ],
    "summary": "Get Products",
    "tags": [
      "Product"
    ]
  }
}
`

### /manufacturers
`json
{
  "get": {
    "operationId": "ManufacturerController_getManufacturers",
    "parameters": [
      {
        "name": "page",
        "required": false,
        "in": "query",
        "description": "Page",
        "schema": {
          "type": "number"
        }
      },
      {
        "name": "limit",
        "required": false,
        "in": "query",
        "description": "Limit",
        "schema": {
          "type": "number"
        }
      },
      {
        "name": "search",
        "required": false,
        "in": "query",
        "description": "Search",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "sortBy",
        "required": false,
        "in": "query",
        "description": "SortBy",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "sortOrder",
        "required": false,
        "in": "query",
        "description": "SortOrder",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "startDate",
        "required": false,
        "in": "query",
        "description": "StartDate",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "endDate",
        "required": false,
        "in": "query",
        "description": "EndDate",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "status",
        "required": false,
        "in": "query",
        "description": "Status",
        "schema": {
          "type": "string"
        }
      }
    ],
    "responses": {
      "200": {
        "description": "",
        "content": {
          "application/json": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/components/schemas/PaginatedDto"
                },
                {
                  "properties": {
                    "data": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Manufacturer"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    },
    "security": [
      {
        "bearer": []
      }
    ],
    "summary": "Get Manufacturers",
    "tags": [
      "Manufacturer"
    ]
  },
  "post": {
    "operationId": "ManufacturerController_createManufacturerAdmin",
    "parameters": [],
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/CreateManufacturerAdminDto"
          }
        }
      }
    },
    "responses": {
      "201": {
        "description": ""
      }
    },
    "security": [
      {
        "bearer": []
      }
    ],
    "summary": "Create Manufacturer Admin",
    "tags": [
      "Manufacturer"
    ]
  }
}
`

### /distributors
`json
{
  "get": {
    "operationId": "DistributorController_getDistributors",
    "parameters": [
      {
        "name": "page",
        "required": false,
        "in": "query",
        "description": "Page",
        "schema": {
          "type": "number"
        }
      },
      {
        "name": "limit",
        "required": false,
        "in": "query",
        "description": "Limit",
        "schema": {
          "type": "number"
        }
      },
      {
        "name": "search",
        "required": false,
        "in": "query",
        "description": "Search",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "sortBy",
        "required": false,
        "in": "query",
        "description": "SortBy",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "sortOrder",
        "required": false,
        "in": "query",
        "description": "SortOrder",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "startDate",
        "required": false,
        "in": "query",
        "description": "StartDate",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "endDate",
        "required": false,
        "in": "query",
        "description": "EndDate",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "status",
        "required": false,
        "in": "query",
        "description": "Status",
        "schema": {
          "type": "string"
        }
      }
    ],
    "responses": {
      "200": {
        "description": "",
        "content": {
          "application/json": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/components/schemas/PaginatedDto"
                },
                {
                  "properties": {
                    "data": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Distributor"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    },
    "security": [
      {
        "bearer": []
      }
    ],
    "summary": "Get Distributors",
    "tags": [
      "Distributor"
    ]
  },
  "post": {
    "operationId": "DistributorController_createDistributorAdmin",
    "parameters": [],
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/CreateDistributorAdminDto"
          }
        }
      }
    },
    "responses": {
      "201": {
        "description": ""
      }
    },
    "security": [
      {
        "bearer": []
      }
    ],
    "summary": "Create Distributor Admin",
    "tags": [
      "Distributor"
    ]
  }
}
`

### /orders
`json
{
  "post": {
    "operationId": "OrdersController_createOrder",
    "parameters": [],
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/CreateOrderDto"
          }
        }
      }
    },
    "responses": {
      "201": {
        "description": ""
      }
    },
    "security": [
      {
        "bearer": []
      }
    ],
    "summary": "Create Order",
    "tags": [
      "Orders"
    ]
  },
  "get": {
    "operationId": "OrdersController_getOrders",
    "parameters": [
      {
        "name": "page",
        "required": false,
        "in": "query",
        "description": "Page",
        "schema": {
          "type": "number"
        }
      },
      {
        "name": "limit",
        "required": false,
        "in": "query",
        "description": "Limit",
        "schema": {
          "type": "number"
        }
      },
      {
        "name": "search",
        "required": false,
        "in": "query",
        "description": "Search",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "sortBy",
        "required": false,
        "in": "query",
        "description": "SortBy",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "sortOrder",
        "required": false,
        "in": "query",
        "description": "SortOrder",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "startDate",
        "required": false,
        "in": "query",
        "description": "StartDate",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "endDate",
        "required": false,
        "in": "query",
        "description": "EndDate",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "status",
        "required": false,
        "in": "query",
        "description": "Status",
        "schema": {
          "type": "string"
        }
      }
    ],
    "responses": {
      "200": {
        "description": "",
        "content": {
          "application/json": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/components/schemas/PaginatedDto"
                },
                {
                  "properties": {
                    "data": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Order"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    },
    "security": [
      {
        "bearer": []
      }
    ],
    "summary": "Get Orders",
    "tags": [
      "Orders"
    ]
  }
}
`

### /shops
`json
{
  "post": {
    "operationId": "ShopController_createShop",
    "parameters": [],
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/CreateShopDto"
          }
        }
      }
    },
    "responses": {
      "201": {
        "description": ""
      }
    },
    "security": [
      {
        "bearer": []
      }
    ],
    "summary": "Create Shop",
    "tags": [
      "Shop"
    ]
  },
  "get": {
    "operationId": "ShopController_getShops",
    "parameters": [
      {
        "name": "page",
        "required": false,
        "in": "query",
        "description": "Page",
        "schema": {
          "type": "number"
        }
      },
      {
        "name": "limit",
        "required": false,
        "in": "query",
        "description": "Limit",
        "schema": {
          "type": "number"
        }
      },
      {
        "name": "search",
        "required": false,
        "in": "query",
        "description": "Search",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "sortBy",
        "required": false,
        "in": "query",
        "description": "SortBy",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "sortOrder",
        "required": false,
        "in": "query",
        "description": "SortOrder",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "startDate",
        "required": false,
        "in": "query",
        "description": "StartDate",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "endDate",
        "required": false,
        "in": "query",
        "description": "EndDate",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "status",
        "required": false,
        "in": "query",
        "description": "Status",
        "schema": {
          "type": "string"
        }
      }
    ],
    "responses": {
      "200": {
        "description": "",
        "content": {
          "application/json": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/components/schemas/PaginatedDto"
                },
                {
                  "properties": {
                    "data": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Shop"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    },
    "security": [
      {
        "bearer": []
      }
    ],
    "summary": "Get Shops",
    "tags": [
      "Shop"
    ]
  }
}
`

### /salesmen
`json
{
  "get": {
    "operationId": "SalesmanController_getSalesmen",
    "parameters": [
      {
        "name": "page",
        "required": false,
        "in": "query",
        "description": "Page",
        "schema": {
          "type": "number"
        }
      },
      {
        "name": "limit",
        "required": false,
        "in": "query",
        "description": "Limit",
        "schema": {
          "type": "number"
        }
      },
      {
        "name": "search",
        "required": false,
        "in": "query",
        "description": "Search",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "sortBy",
        "required": false,
        "in": "query",
        "description": "SortBy",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "sortOrder",
        "required": false,
        "in": "query",
        "description": "SortOrder",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "startDate",
        "required": false,
        "in": "query",
        "description": "StartDate",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "endDate",
        "required": false,
        "in": "query",
        "description": "EndDate",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "status",
        "required": false,
        "in": "query",
        "description": "Status",
        "schema": {
          "type": "string"
        }
      }
    ],
    "responses": {
      "200": {
        "description": "",
        "content": {
          "application/json": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/components/schemas/PaginatedDto"
                },
                {
                  "properties": {
                    "data": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Salesman"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    },
    "security": [
      {
        "bearer": []
      }
    ],
    "summary": "Get Salesmen",
    "tags": [
      "Salesman"
    ]
  }
}
`

