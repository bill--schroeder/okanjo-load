# Basic Okanjo Product Loader 

This app provides a base framework for mass uploading products to Okanjo from any type of data source.

See the [Okanjo Documentation](okanjo.github.io/okanjo-docs/build/index.html) for information on the API.
See the [Okanjo NodeJS SDK](github.com/okanjo/okanjo-nodejs) for information on the Okanjo NodeJS SDK.

## Prerequisites

To use Okanjo API, you must have the following:
* An API key
* An API passphrase.
* A user and store on Okanjo

## Getting Started

1. Fork this repository or clone locally.
2. Copy config.default.js to config.js and update with your API key, passphrase and user credentials.
3. Edit index.js:
 1. **Edit the getSourceProducts function.** This is where you should query your data source and pull all the applicable product information for the products to upload. The function should callback with two params `(err, data)`, where `err` is an `Error` object if something went horribly wrong, and `data` is an array of objects, containing information about your products.
 2. **Edit the mapCategory function.** This is where you should map your internal product category taxonomy to the Okanjo category taxonomy. You can be creative here, perhaps doing programmatic searches, queries, etc. The funciton should callback with two params `(err, data)` where `err` is an `Error` object if something goes bad, and `data` is the ID of the Okanjo category which best categories the given product.
 3. **Edit the processAndLoadProducts function.** This is the core of the loader, in that it takes the data from your data source, builds an Okanjo product, uploads images and posts the final product to Okanjo. This is where you should essentially map the data from your data source to Okanjo's data format. When in doubt, reference the [Okanjo post product documentation](http://okanjo.github.io/okanjo-docs/build/Products.html#POST /products). This funciton should callback with `(err, data)`, where `err` is an `Error` object if something blew up, and `data` is an array of Okanjo products, returned from the API after successfully posting.

The only other thing you may need to customize, is what happens after the userLogin call. If you are using an account with multiple stores, you may need to manually or programmatically configure which store ID to use. 

## Running The Import

To execute, run the following command:
```sh
node index.js
```
