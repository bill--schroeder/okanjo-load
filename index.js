/**
 * Date: 5/27/14 2:12 PM
 *
 * ----
 *
 * (c) Okanjo Partners Inc
 * https://okanjo.com
 * support@okanjo.com
 *
 * https://github.com/okanjo/okanjo-load
 *
 * ----
 *
 * TL;DR? see: http://www.tldrlegal.com/license/mit-license
 *
 * The MIT License (MIT)
 * Copyright (c) 2013 Okanjo Partners Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var okanjo = require('okanjo'),
    async = require('async'),
    config = require('./config'),
    // Upload dependencies
    path = require('path'),
    mime = require('mime'),
    // Upload via URL dependencies
    url = require('url'),
    http = require('http'),
    https = require('https'),
    fs = require('fs'),
    sanitize = require('sanitize-filename'),
    crypto = require('crypto'),
    request = require('request'),
    csv = require('fast-csv');


/**
 * This is where you should integrate with your data source to all the data you need to create products
 *
 * This function should callback with two parameters:
 * 1) err - should be null when no error was detected or an Error object if one was detected
 * 2) array of data - this should be the primary result set, representing one product per index
 *
 * The result of this callback is piped directly into the processAndLoadProducts function below
 *
 * @param {function(err:Error, data:[*])} callback – Function called after the data has been retrieved
 */
function getSourceProducts(callback) {

    var path = "data/product_with_category.csv";

    // var transform = function(p) {
    //     //TODO - apply transforms to raw spreadsheet data
    //     return {
    //         //TODO - need to properly implement categories
    //         category: "Art",
    //         // The ID of the Okanjo store to add the product to
    //         store_id: global_store_id || p.store_id || 0,

    //         // Type of product (usually regular)
    //         type: okanjo.constants.productType.regular,

    //         // Basic info
    //         title: p["Title"] || 'Product title',
    //         description: p["Description"] || 'Product\nDescription',
    //         price: p["Price"] || 10, // USD between 1 and 9000
    //         stock: p["Quantity"] != null ? p["Quantity"] : 0, // Use empty string "" to indicate an on-demand (infinite stock) item

    //         // Product condition - use brandNew or used
    //         condition: okanjo.constants.productCondition.brandNew,

    //         is_local_pickup = p["Local_Pickup_yes_or_no"] || 0;

    //         // Generic free shipping option
    //         is_free_shipping = p["Free_Shipping_yes_or_no"] || 0;
    //     };
    // };

    var rows = [];
    csv
        .fromPath(path, {headers: true})
        .on("record", function(data){
            rows.push(data)
        })
        .on("end", function(data){
            callback(null, rows);
        });
    /************************
     * TODO: CUSTOMIZE THIS *
     ************************/

    /* MYSQL EXAMPLE - do an npm install mysql
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'me',
        password : 'secret'
    });

    connection.connect();

    connection.query('SELECT * FROM products WHERE import = 1 AND stock > 0', function(err, rows, fields) {
        if (err) callback && callback(err);

        callback && callback(null, rows);
    });

    connection.end();
    */


    /* MONGO EXAMPLE - do an npm install mongodb
    var MongoClient = require('mongodb').MongoClient
        , format = require('util').format;

    MongoClient.connect('mongodb://localhost:27017/test_db', function(err, db) {
        if(err) throw err;

        var collection = db
            .collection('products')
            .find({})
            .toArray(function(err, docs) {
                if (err) callback && callback(err);

                callback && callback(null, docs);
            });
    });
    */

    //
    // Here's a default example of what a row of data could look like
    //
    // TODO: Remove this
    // callback && callback(null, [
    //     {
    //         title: 'WebGL Game Development',
    //         description: 'WebGL, the web implementation of Open GL, is a JavaScript API used to render interactive 3D graphics within any compatible web browser, without the need for plugins. It helps you create detailed, high-quality graphical 3D objects easily. WebGL elements can be mixed with other HTML elements and composites to create high-quality, interactive, creative, innovative graphical 3D objects.\n\n' +
    //             'This book begins with collecting coins in Super Mario, killing soldiers in Contra, and then quickly evolves to working out strategies in World of Warcraft. You will be guided through creating animated characters, image processing, and adding effects as part of the web page canvas to the 2D/3D graphics. Pour life into your gaming characters and learn how to create special effects seen in the most powerful 3D games. Each chapter begins by showing you the underlying mathematics and its programmatic implementation, ending with the creation of a complete game scene to build a wonderful virtual world.\n\nISBN: 9781849699792',
    //         price: 45,
    //         stock: "",
    //         images: [
    //             path.join(__dirname, path.sep, 'images', path.sep, 'webgl_cover.png'), // e.g. portable local path, /images/webgl_cover.png
    //             'http://www.packtpub.com/sites/default/files/9792OT_WebGL%20Game%20Development.jpg'
    //         ],
    //         category: 'Entertainment > Books',
    //         is_local_pickup: 0,
    //         is_free_shipping: 1,
    //         tags: 'Games,WebGL,HTML5,JSON,Physics,JavaScript'.split(',')

    //     }
    // ]);

}


/**
 * Maps a local category to an Okanjo category.
 *
 * This function should callback with two parameters:
 * 1) err - should be null when no error was detected or an Error object if one was detected
 * 2) id - ID of the category the product should be placed within
 *
 * We've provided a basic set of the Okanjo category taxonomy.
 * Update this section to map your products to the respective Okanjo categories.
 *
 * You can be as creative as you would like to be here, since the product row is passed in,
 * further lookups / processing can be done here.
 *
 * @param {*} product - The product row to map to a category
 * @param {function(err:Error, data:Number)} callback – Function called after the data has been retrieved
 */
function mapCategory(product, callback) {

    // Category Reference: http://jsfiddle.net/kfitzgerald/gCaba/2/
    // Case statement reference: http://jsfiddle.net/kfitzgerald/Yfv8u/1/

    /************************
     * TODO: CUSTOMIZE THIS *
     ************************/

    var id = (function(product) {

        //mapping is done in the spreadsheet
        
        return product.category;

        // switch(product.category) {
        //     case "Art": return 2;
        //     case "Art > Direct from the Artist": return 11;
        //     case "Art > Direct from the Artist > Drawing": return 21;
        //     case "Art > Direct from the Artist > Painting": return 22;
        //     case "Art > Direct from the Artist > Digital": return 24;
        //     case "Art > Direct from the Artist > Photography": return 25;
        //     case "Art > Direct from the Artist > Collage": return 26;
        //     case "Art > Direct from the Artist > Mixed Media": return 27;
        //     case "Art > Direct from the Artist > Sculpture": return 28;
        //     case "Art > Direct from the Artist > Jewelry": return 29;
        //     case "Art > Direct from the Artist > Other": return 30;
        //     case "Art > Direct from the Artist > Illustration": return 492;
        //     case "Art > Poster": return 12;
        //     case "Art > Poster > Direct from the Artist": return 31;
        //     case "Art > Poster > Vintage": return 38;
        //     case "Art > Print": return 13;
        //     case "Art > Print > Direct from the Artist": return 32;
        //     case "Art > Print > Drawing": return 39;
        //     case "Art > Print > Painting": return 40;
        //     case "Art > Print > Mixed Media": return 41;
        //     case "Art > Print > Digital": return 42;
        //     case "Art > Print > Photography": return 43;
        //     case "Art > Print > Vintage": return 44;
        //     case "Art > Print > Other": return 45;
        //     case "Art > Drawing": return 14;
        //     case "Art > Drawing > Direct from the Artist": return 33;
        //     case "Art > Drawing > Other": return 46;
        //     case "Art > Painting": return 16;
        //     case "Art > Painting > Direct from the Artist": return 35;
        //     case "Art > Painting > Other": return 48;
        //     case "Art > Photography": return 17;
        //     case "Art > Photography > Direct from the Artist": return 36;
        //     case "Art > Photography > Other": return 49;
        //     case "Art > Collage": return 18;
        //     case "Art > Collage > Other": return 50;
        //     case "Art > Collage > Direct from the Artist": return 53;
        //     case "Art > Crafts": return 19;
        //     case "Art > Crafts > Jewelry": return 56;
        //     case "Art > Crafts > Home": return 57;
        //     case "Art > Crafts > Supplies": return 58;
        //     case "Art > Crafts > Kids": return 59;
        //     case "Art > Crafts > Sewing": return 60;
        //     case "Art > Crafts > Scrapbooking": return 61;
        //     case "Art > Crafts > Stamping": return 62;
        //     case "Art > Other": return 52;
        //     case "Art > Illustration": return 493;
        //     case "Art > Illustration > Other": return 494;
        //     case "Art > Illustration > Direct from the Artist": return 495;
        //     case "Collectibles": return 3;
        //     case "Collectibles > Cards": return 65;
        //     case "Collectibles > Cards > Baseball": return 96;
        //     case "Collectibles > Cards > Basketball": return 97;
        //     case "Collectibles > Cards > Other": return 98;
        //     case "Collectibles > Cards > Football": return 123;
        //     case "Collectibles > Coins": return 66;
        //     case "Collectibles > Coins > US": return 99;
        //     case "Collectibles > Coins > World": return 101;
        //     case "Collectibles > Paper money": return 67;
        //     case "Collectibles > Paper money > US": return 100;
        //     case "Collectibles > Paper money > World": return 102;
        //     case "Collectibles > Sports": return 69;
        //     case "Collectibles > Sports > Apparel": return 103;
        //     case "Collectibles > Sports > Apparel > Baseball": return 106;
        //     case "Collectibles > Sports > Apparel > Basketball": return 109;
        //     case "Collectibles > Sports > Apparel > Football": return 112;
        //     case "Collectibles > Sports > Apparel > Hockey": return 115;
        //     case "Collectibles > Sports > Apparel > Golf": return 118;
        //     case "Collectibles > Sports > Apparel > Soccer": return 121;
        //     case "Collectibles > Sports > Equipment": return 104;
        //     case "Collectibles > Sports > Equipment > Baseball": return 107;
        //     case "Collectibles > Sports > Equipment > Basketball": return 110;
        //     case "Collectibles > Sports > Equipment > Football": return 113;
        //     case "Collectibles > Sports > Equipment > Hockey": return 116;
        //     case "Collectibles > Sports > Equipment > Golf": return 119;
        //     case "Collectibles > Sports > Equipment > Soccer": return 122;
        //     case "Collectibles > Sports > Baseball": return 105;
        //     case "Collectibles > Sports > Basketball": return 108;
        //     case "Collectibles > Sports > Football": return 111;
        //     case "Collectibles > Sports > Hockey": return 114;
        //     case "Collectibles > Sports > Golf": return 117;
        //     case "Collectibles > Sports > Soccer": return 120;
        //     case "Collectibles > Stamps": return 70;
        //     case "Collectibles > Antiques": return 72;
        //     case "Collectibles > Autographed": return 74;
        //     case "Collectibles > Comics": return 75;
        //     case "Collectibles > Other": return 76;

        //     case "Electronics": return 4;
        //     case "Electronics > Videogames": return 155;
        //     case "Electronics > Videogames > Games": return 176;
        //     case "Electronics > Videogames > Consoles": return 177;
        //     case "Electronics > Computers": return 179;
        //     case "Electronics > Computers > Desktops": return 180;
        //     case "Electronics > Computers > Notebooks": return 181;
        //     case "Electronics > Computers > Tablets": return 182;
        //     case "Electronics > Computers > Apple": return 183;
        //     case "Electronics > Computers > PCs": return 184;
        //     case "Electronics > Computers > Accessories": return 185;
        //     case "Electronics > Computers > Software": return 187;
        //     case "Electronics > TVs": return 191;
        //     case "Electronics > TVs > LCD": return 193;
        //     case "Electronics > TVs > LED": return 194;
        //     case "Electronics > TVs > Tube": return 195;
        //     case "Electronics > TVs > Other": return 196;
        //     case "Electronics > TVs > Accessories": return 536;
        //     case "Electronics > Audio": return 197;
        //     case "Electronics > Audio > Headphones": return 198;
        //     case "Electronics > Audio > MP3": return 199;
        //     case "Electronics > Audio > iPods": return 200;
        //     case "Electronics > Audio > Speakers": return 201;
        //     case "Electronics > Audio > Other": return 202;
        //     case "Electronics > Audio > Accessories": return 203;
        //     case "Electronics > Photography": return 207;
        //     case "Electronics > Photography > Cameras": return 208;
        //     case "Electronics > Photography > Lighting": return 209;
        //     case "Electronics > Photography > Accessories": return 211;
        //     case "Electronics > Musical Instruments": return 212;
        //     case "Electronics > Print & fax": return 213;
        //     case "Electronics > Other": return 214;
        //     case "Electronics > Other > Monitors": return 215;
        //     case "Electronics > Other > Projectors": return 216;
        //     case "Electronics > Other > Mobile Phones": return 217;
        //     case "Electronics > Other > Surveillance": return 218;
        //     case "Electronics > Other > Car Electronics": return 219;
        //     case "Electronics > DVD Players": return 221;

        //     case "Entertainment": return 5;
        //     case "Entertainment > Books": return 233;
        //     case "Entertainment > Books > Fiction": return 240;
        //     case "Entertainment > Books > Nonfiction": return 241;
        //     case "Entertainment > Books > Cooking": return 243;
        //     case "Entertainment > Books > Children's": return 245;
        //     case "Entertainment > Books > Young Adult": return 247;
        //     case "Entertainment > Books > Magazines": return 249;
        //     case "Entertainment > Books > Catalogs": return 250;
        //     case "Entertainment > Books > Audiobooks": return 251;
        //     case "Entertainment > Books > Accessories": return 500;
        //     case "Entertainment > Movies": return 234;
        //     case "Entertainment > Movies > DVD": return 253;
        //     case "Entertainment > Movies > Blu-ray": return 254;
        //     case "Entertainment > Movies > VHS": return 258;
        //     case "Entertainment > Movies > Other": return 259;
        //     case "Entertainment > Music": return 236;
        //     case "Entertainment > Music > Cassettes": return 261;
        //     case "Entertainment > Music > CDs": return 262;
        //     case "Entertainment > Music > Records": return 263;
        //     case "Entertainment > Music > Instruments": return 264;
        //     case "Entertainment > Music > Other": return 543;
        //     case "Entertainment > Videogames": return 238;
        //     case "Entertainment > Videogames > Games": return 265;
        //     case "Entertainment > Videogames > Consoles": return 266;
        //     case "Entertainment > Videogames > Accessories": return 534;
        //     case "Entertainment > TV Shows": return 523;

        //     case "Fashion": return 6;
        //     case "Fashion > Men": return 349;
        //     case "Fashion > Men > Tops": return 402;
        //     case "Fashion > Men > Bottoms": return 405;
        //     case "Fashion > Men > Bottoms > Jeans": return 421;
        //     case "Fashion > Men > Bottoms > Pants": return 423;
        //     case "Fashion > Men > Bottoms > Shorts": return 425;
        //     case "Fashion > Men > Bottoms > Swim": return 431;
        //     case "Fashion > Men > Bottoms > Other": return 468;
        //     case "Fashion > Men > Shoes": return 408;
        //     case "Fashion > Men > Accessories": return 410;
        //     case "Fashion > Men > Accessories > Bags": return 435;
        //     case "Fashion > Men > Accessories > Wallets": return 436;
        //     case "Fashion > Men > Accessories > Belts": return 438;
        //     case "Fashion > Men > Accessories > Hats": return 440;
        //     case "Fashion > Men > Accessories > Glasses": return 441;
        //     case "Fashion > Men > Accessories > Ties": return 442;
        //     case "Fashion > Men > Accessories > Scarves": return 443;
        //     case "Fashion > Men > Accessories > Jewelry": return 521;
        //     case "Fashion > Men > Outerwear": return 412;
        //     case "Fashion > Men > Activewear": return 414;
        //     case "Fashion > Men > Other": return 469;
        //     case "Fashion > Women": return 350;
        //     case "Fashion > Women > Tops": return 403;
        //     case "Fashion > Women > Bottoms": return 406;
        //     case "Fashion > Women > Bottoms > Jeans": return 422;
        //     case "Fashion > Women > Bottoms > Pants": return 424;
        //     case "Fashion > Women > Bottoms > Shorts": return 426;
        //     case "Fashion > Women > Bottoms > Skirts": return 445;
        //     case "Fashion > Women > Bottoms > Other": return 471;
        //     case "Fashion > Women > Shoes": return 409;
        //     case "Fashion > Women > Accessories": return 411;
        //     case "Fashion > Women > Accessories > Jewelry": return 448;
        //     case "Fashion > Women > Accessories > Bags": return 450;
        //     case "Fashion > Women > Accessories > Belts": return 453;
        //     case "Fashion > Women > Accessories > Scarves": return 454;
        //     case "Fashion > Women > Accessories > Hats": return 455;
        //     case "Fashion > Women > Accessories > Glasses": return 456;
        //     case "Fashion > Women > Accessories > Wallets": return 498;
        //     case "Fashion > Women > Outerwear": return 413;
        //     case "Fashion > Women > Activewear": return 415;
        //     case "Fashion > Women > Dresses": return 447;
        //     case "Fashion > Women > Other": return 470;
        //     case "Fashion > Kids": return 351;
        //     case "Fashion > Kids > Baby": return 418;
        //     case "Fashion > Kids > Boys": return 524;
        //     case "Fashion > Kids > Boys > Tops": return 526;
        //     case "Fashion > Kids > Boys > Bottoms": return 528;
        //     case "Fashion > Kids > Boys > Accessories": return 530;
        //     case "Fashion > Kids > Boys > Shoes": return 532;
        //     case "Fashion > Kids > Girls": return 525;
        //     case "Fashion > Kids > Girls > Tops": return 527;
        //     case "Fashion > Kids > Girls > Bottoms": return 529;
        //     case "Fashion > Kids > Girls > Accessories": return 531;
        //     case "Fashion > Kids > Girls > Shoes": return 533;
        //     case "Fashion > Kids > Girls > Dresses": return 544;
        //     case "Fashion > Clothing": return 352;
        //     case "Fashion > Clothing > Tops": return 404;
        //     case "Fashion > Clothing > Bottoms": return 407;
        //     case "Fashion > Shoes": return 353;
        //     case "Fashion > Accessories": return 354;
        //     case "Fashion > Accessories > Jewelry": return 457;
        //     case "Fashion > Accessories > Bags": return 458;
        //     case "Fashion > Accessories > Belts": return 459;
        //     case "Fashion > Accessories > Scarves": return 460;
        //     case "Fashion > Accessories > Hats": return 461;
        //     case "Fashion > Accessories > Glasses": return 462;
        //     case "Fashion > Accessories > Men": return 465;
        //     case "Fashion > Accessories > Women": return 466;
        //     case "Fashion > Accessories > Wallets": return 499;
        //     case "Fashion > Beauty": return 355;
        //     case "Fashion > Beauty > Makeup": return 472;
        //     case "Fashion > Beauty > Bath": return 473;
        //     case "Fashion > Beauty > Bath > Soap": return 475;
        //     case "Fashion > Beauty > Bath > Body Wash": return 476;
        //     case "Fashion > Beauty > Bath > Women": return 477;
        //     case "Fashion > Beauty > Bath > Men": return 478;
        //     case "Fashion > Beauty > Skin Care": return 479;
        //     case "Fashion > Beauty > Skin Care > Men": return 480;
        //     case "Fashion > Beauty > Skin Care > Women": return 481;
        //     case "Fashion > Beauty > Skin Care > Face": return 485;
        //     case "Fashion > Beauty > Skin Care > Body": return 486;
        //     case "Fashion > Beauty > Skin Care > Lotion": return 487;
        //     case "Fashion > Beauty > Nail Care": return 488;
        //     case "Fashion > Beauty > Hair Care": return 489;
        //     case "Fashion > Beauty > Hair Care > Men": return 490;
        //     case "Fashion > Beauty > Hair Care > Women": return 491;
        //     case "Fashion > Beauty > Fragrances": return 496;

        //     case "Home": return 7;
        //     case "Home > Crafts": return 357;
        //     case "Home > Crafts > Jewelry": return 358;
        //     case "Home > Crafts > Supplies": return 359;
        //     case "Home > Crafts > Kids": return 360;
        //     case "Home > Crafts > Sewing": return 361;
        //     case "Home > Crafts > Scrapbooking": return 362;
        //     case "Home > Crafts > Stamping": return 363;
        //     case "Home > Other": return 364;
        //     case "Home > Pets": return 365;
        //     case "Home > Garden": return 366;
        //     case "Home > Accessories": return 367;
        //     case "Home > Accessories > Lighting": return 368;
        //     case "Home > Accessories > Bedding": return 369;
        //     case "Home > Accessories > Décor": return 370;
        //     case "Home > Accessories > Appliances": return 372;
        //     case "Home > Accessories > Kitchen & Dining": return 373;
        //     case "Home > Accessories > Bathroom": return 374;
        //     case "Home > Accessories > Bedroom": return 375;
        //     case "Home > Accessories > Living": return 376;
        //     case "Home > Accessories > Office": return 377;
        //     case "Home > Accessories > Rugs": return 515;
        //     case "Home > Accessories > Drapes & Blinds": return 516;
        //     case "Home > Accessories > Holiday": return 517;
        //     case "Home > Accessories > Party": return 518;
        //     case "Home > Accessories > Other": return 520;
        //     case "Home > Office": return 379;
        //     case "Home > Office > Furniture": return 380;
        //     case "Home > Office > Accessories": return 381;
        //     case "Home > Office > Accessories > Lighting": return 382;
        //     case "Home > Office > Accessories > Décor": return 383;
        //     case "Home > Office > Accessories > Other": return 384;
        //     case "Home > Kitchen & Dining": return 385;
        //     case "Home > Kitchen & Dining > Furniture": return 389;
        //     case "Home > Kitchen & Dining > Accessories": return 390;
        //     case "Home > Kitchen & Dining > Appliances": return 391;
        //     case "Home > Kitchen & Dining > Other": return 522;
        //     case "Home > Bathroom": return 386;
        //     case "Home > Bathroom > Furniture": return 392;
        //     case "Home > Bathroom > Accessories": return 393;
        //     case "Home > Bathroom > Other": return 497;
        //     case "Home > Bedroom": return 387;
        //     case "Home > Bedroom > Accessories": return 394;
        //     case "Home > Bedroom > Accessories > Bedding": return 396;
        //     case "Home > Bedroom > Accessories > Lighting": return 397;
        //     case "Home > Bedroom > Accessories > Décor": return 398;
        //     case "Home > Bedroom > Accessories > Other": return 399;
        //     case "Home > Bedroom > Furniture": return 395;
        //     case "Home > Bedroom > Other": return 502;
        //     case "Home > Living": return 388;
        //     case "Home > Living > Furniture": return 400;
        //     case "Home > Living > Accessories": return 401;
        //     case "Home > Furniture": return 503;
        //     case "Home > Furniture > Chairs": return 504;
        //     case "Home > Furniture > Tables": return 505;
        //     case "Home > Furniture > Sofas": return 506;
        //     case "Home > Furniture > Beds": return 507;
        //     case "Home > Furniture > Dressers": return 508;
        //     case "Home > Furniture > Shelving": return 509;
        //     case "Home > Furniture > Cabinets": return 511;
        //     case "Home > Furniture > Other": return 512;
        //     case "Home > Furniture > Dining Sets": return 513;

        //     case "Sports": return 8;
        //     case "Sports > Apparel": return 63;
        //     case "Sports > Apparel > Baseball": return 64;
        //     case "Sports > Apparel > Basketball": return 68;
        //     case "Sports > Apparel > Football": return 71;
        //     case "Sports > Apparel > Hockey": return 73;
        //     case "Sports > Apparel > Golf": return 77;
        //     case "Sports > Apparel > Soccer": return 78;
        //     case "Sports > Apparel > Outdoor Sports": return 79;
        //     case "Sports > Apparel > Outdoor Sports > Fishing": return 80;
        //     case "Sports > Apparel > Outdoor Sports > Hunting": return 81;
        //     case "Sports > Apparel > Outdoor Sports > Camping": return 82;
        //     case "Sports > Apparel > Outdoor Sports > Boating": return 83;
        //     case "Sports > Apparel > Outdoor Sports > Other": return 311;
        //     case "Sports > Apparel > Outdoor Sports > Water Sports": return 339;
        //     case "Sports > Apparel > Other": return 310;
        //     case "Sports > Apparel > Other > Wrestling": return 324;
        //     case "Sports > Apparel > Other > Running": return 327;
        //     case "Sports > Apparel > Other > Tennis": return 331;
        //     case "Sports > Apparel > Other > Winter Sports": return 336;
        //     case "Sports > Apparel > Fitness": return 319;
        //     case "Sports > Apparel > Cycling": return 321;
        //     case "Sports > Baseball": return 86;
        //     case "Sports > Baseball > Equipment": return 268;
        //     case "Sports > Baseball > Apparel": return 276;
        //     case "Sports > Equipment": return 88;
        //     case "Sports > Equipment > Baseball": return 133;
        //     case "Sports > Equipment > Basketball": return 136;
        //     case "Sports > Equipment > Football": return 137;
        //     case "Sports > Equipment > Hockey": return 140;
        //     case "Sports > Equipment > Golf": return 142;
        //     case "Sports > Equipment > Soccer": return 143;
        //     case "Sports > Equipment > Outdoor Sports": return 220;
        //     case "Sports > Equipment > Outdoor Sports > Fishing": return 285;
        //     case "Sports > Equipment > Outdoor Sports > Hunting": return 289;
        //     case "Sports > Equipment > Outdoor Sports > Camping": return 291;
        //     case "Sports > Equipment > Outdoor Sports > Boating": return 294;
        //     case "Sports > Equipment > Outdoor Sports > Other": return 313;
        //     case "Sports > Equipment > Outdoor Sports > Water Sports": return 340;
        //     case "Sports > Equipment > Fitness": return 252;
        //     case "Sports > Equipment > Cycling": return 260;
        //     case "Sports > Equipment > Other": return 312;
        //     case "Sports > Equipment > Other > Wrestling": return 325;
        //     case "Sports > Equipment > Other > Running": return 328;
        //     case "Sports > Equipment > Other > Tennis": return 332;
        //     case "Sports > Equipment > Other > Winter Sports": return 337;
        //     case "Sports > Basketball": return 89;
        //     case "Sports > Basketball > Equipment": return 269;
        //     case "Sports > Basketball > Apparel": return 277;
        //     case "Sports > Football": return 90;
        //     case "Sports > Football > Equipment": return 270;
        //     case "Sports > Football > Apparel": return 278;
        //     case "Sports > Hockey": return 91;
        //     case "Sports > Hockey > Equipment": return 271;
        //     case "Sports > Hockey > Apparel": return 279;
        //     case "Sports > Outdoor Sports": return 92;
        //     case "Sports > Outdoor Sports > Fishing": return 286;
        //     case "Sports > Outdoor Sports > Fishing > Apparel": return 343;
        //     case "Sports > Outdoor Sports > Fishing > Equipment": return 345;
        //     case "Sports > Outdoor Sports > Hunting": return 290;
        //     case "Sports > Outdoor Sports > Hunting > Apparel": return 342;
        //     case "Sports > Outdoor Sports > Hunting > Equipment": return 344;
        //     case "Sports > Outdoor Sports > Camping": return 292;
        //     case "Sports > Outdoor Sports > Boating": return 295;
        //     case "Sports > Outdoor Sports > Other": return 314;
        //     case "Sports > Golf": return 93;
        //     case "Sports > Golf > Equipment": return 272;
        //     case "Sports > Golf > Apparel": return 280;
        //     case "Sports > Collectibles": return 94;
        //     case "Sports > Collectibles > Equipment": return 273;
        //     case "Sports > Collectibles > Apparel": return 281;
        //     case "Sports > Collectibles > Autographed": return 283;
        //     case "Sports > Other": return 309;
        //     case "Sports > Other > Wrestling": return 326;
        //     case "Sports > Other > Running": return 329;
        //     case "Sports > Other > Tennis": return 333;
        //     case "Sports > Other > Winter Sports": return 338;
        //     case "Sports > Other > Water Sports": return 341;
        //     case "Sports > Other > Cycling": return 346;
        //     case "Sports > Other > Fitness": return 347;
        //     case "Sports > Other > Boating": return 348;
        //     case "Sports > Other > Soccer": return 514;

        //     case "Toys": return 9;
        //     case "Toys > Hobbies": return 124;
        //     case "Toys > Kids": return 125;
        //     case "Toys > Games": return 126;

        //     default: // <---------------------------------------------------------------------------------- [ DEFAULT ]
        //     case "Other": return 10;
        //     case "Other > Auto": return 127;
        //     case "Other > Pets": return 128;
        //     case "Other > Hobbies": return 129;
        //     case "Other > Hobbies > Crafts": return 132;
        //     case "Other > Hobbies > Sports": return 134;
        //     case "Other > Hobbies > Toys": return 135;
        //     case "Other > Health": return 130;
        //     case "Other > Health > Nutrition": return 138;
        //     case "Other > Health > Fitness": return 139;
        //     case "Other > Health > Other": return 141;
        //     case "Other > Crafts": return 131;
        //     case "Other > Crafts > Jewelry": return 144;
        //     case "Other > Crafts > Home": return 145;
        //     case "Other > Crafts > Supplies": return 146;
        //     case "Other > Crafts > Kids": return 147;
        //     case "Other > Crafts > Sewing": return 148;
        //     case "Other > Crafts > Scrapbooking": return 149;
        //     case "Other > Crafts > Stamping": return 150;
        //     case "Other > Parenting": return 537;
        //     case "Other > Parenting > Grooming": return 538;
        //     case "Other > Parenting > Safety": return 539;
        //     case "Other > Parenting > Feeding": return 540;
        //     case "Other > Parenting > Gear": return 541;
        //     case "Other > Parenting > Nursery": return 542;
        //     case "Other > Local Offers": return 545;
        // }
    })(product);

    console.log("id is " + id);

    callback && callback(null, id);

}


/**
 * This function takes product data "rows" and converts them into an Okanjo product.
 *
 * The majority of the heavy lifting and customization will likely need to be done here.
 *
 * @param {[*]} products - Array of product data rows
 * @param {function(err:Error, data:[*])} callback – Function called after the products have been uploaded
 */
function processAndLoadProducts(products, callback) {

    async.mapSeries(products, function(p, callback) {

        // Reference: http://okanjo.github.io/okanjo-docs/build/Products.html#POST /products

        /********************************
         * TODO: CUSTOMIZE THIS SECTION *
         ********************************/

        //
        // Basic, required fields -------------------------------------------------------------------------------------
        //

        var productData = {

            // The ID of the Okanjo store to add the product to
            store_id: global_store_id || p.store_id || 0,

            // Type of product (usually regular)
            type: okanjo.constants.productType.regular,

            // Basic info
            title: p["Title"] || 'Product title',
            //description: p["Description"] || 'Product\nDescription',
            price: p["Price"] ? Math.ceil(p["Price"]) : 0, // USD between 1 and 9000
            stock: p["Quantity"] != null ? p["Quantity"] : 0, // Use empty string "" to indicate an on-demand (infinite stock) item

            // Product condition - use brandNew or used
            condition: okanjo.constants.productCondition.brandNew
        };

        //remove html from description
        var regex = /(<([^>]+)>)/ig
        productData.description = p["Description"].replace(regex, "");

        p.category = p["Cat_ID"];

        //
        // Required: Shipping options ---------------------------------------------------------------------------------
        //

        // At least one shipping method must be given: local pickup, free shipping, or defined shipping methods + cost
        // You can use either is_free_shipping OR shipping_options, not both.

        // Local pickup (zero cost, implies the buyer / seller will work out pickup time and location)
        productData.is_local_pickup = p["Local_Pickup_yes_or_no"] == "Yes" ? 1 : 0;

        // Generic free shipping option 
        //TODO - all products are free shipping for now
        productData.is_free_shipping = 1;
        // -or-


        //
        // Required: Return Policy ------------------------------------------------------------------------------------
        //

        // Use these fields to specify the product's return policy
        //productData.return_policy = { id: 0 }; // Default return policy (no returns) or use a known ID for reuse
       productData.return_policy = { // Custom return policy
           name: 'Special Returns',
           policy: p["Return_Policy"]
       };


        //
        // Optional: Cause-donation fields ----------------------------------------------------------------------------
        //

        // Use these fields to set what cause benefits from the sale of the item
        // Uncomment these fields if  cause / donation should be used

        //TODO - need real cause_id 
        productData.cause_id = 35861;       // ID of the cause e.g. api.getCauses()
        productData.donation_perc = p["Percent_Donated"];  // A number ranging from 5 to 100, representing the percent donation of the sale


        //
        // Optional: Tags ---------------------------------------------------------------------------------------------
        //

//        productData.tags = [
//            { id: 0 }, // By known tag id
//            { name: 'WebGL' } // By tag name
//        ];

        // // If tags were given on the row, add them by name
        // if (p.tags && p.tags.length > 0) {
        //     productData.tags = [];
        //     for(var i = 0, t= p.tags[i]; i < p.tags.length; i++) {
        //         productData.tags.push({ name: t });
        //     }
        // }

        productData.meta = {
            "vendor": "School Specialty",
            "SKU": p["Tag_2"],
            "UOM": p["Tag_3"]
        };

        console.log("meta data for product is " + JSON.stringify(productData.meta));

        p.images = [
            p["Main_Image_URL"]
        ];

        if(p["Image_URL_2"]) {
            p.images.push(p["Image_URL_2"]);
        }

        if(p["Image_URL_3"]) {
            p.images.push(p["Image_URL_3"]);
        }

        if(p["Image_URL_4"]) {
            p.images.push(p["Image_URL_4"]);
        }

        if(p["Image_URL_5"]) {
            p.images.push(p["Image_URL_5"]);
        }

        //
        // Optional: Auction-specific fields --------------------------------------------------------------------------
        //

        // Use these fields to configure auction-type products
        // To use, uncomment this block
//        productData.type = okanjo.constants.productType.auction;
//        productData.auction_start = '2014-06-01T00:00:00+00:00'; // ISO 8601 formatted date + time
//        productData.auction_end =   '2014-06-15T00:00:00+00:00';   // ISO 8601 formatted date + time
//        productData.auction_min_bid = 5; // Auction starting bid in USD


        //
        // Optional: Dimensions + Variants ----------------------------------------------------------------------------
        //

        // Use these fields to configure available product variants (e.g. sizes, colors, etc)
        // Comment the dimension/variant blocks if you don't need to use variants

        // First, define the available dimension set
        // The order added to the object is how they will appear on the page
        // productData.dimensions = {
        //     "Size": {
        //         "Small":  { price_modifier: 0 },
        //         "Large":  { price_modifier: 0 }
        //     },
        //     "Color": {
        //         "Red":    { price_modifier: 0 },
        //         "Purple": { price_modifier: 10 }
        //     }
        // };

        // // Then setup stock permutations for every possible set
        // // Remember, variant keys must be sorted alphabetically
        // productData.variants = {};
        // productData.variants[okanjo.serialize({ "Size": "Small", "Color": "Red" }, true)] = { stock: 10 };
        // productData.variants[okanjo.serialize({ "Size": "Small", "Color": "Purple" }, true)] = { stock: 20 };
        // productData.variants[okanjo.serialize({ "Size": "Large", "Color": "Red" }, true)] = { stock: 30 };
        // productData.variants[okanjo.serialize({ "Size": "Large", "Color": "Purple" }, true)] = { stock: "" }; // Example with on-demand (infinite) stock

        (function(productData){

            //
            // Required: Category -------------------------------------------------------------------------------------
            //

            mapCategory(p, function(err, categoryId) {
                if (err) { callback && callback(err); return; }

                // Assign mapped category id
                console.log("cat id is " + categoryId);
                console.log("err is " + err);
                productData.category_id = categoryId;

                //
                // Required: Media ------------------------------------------------------------------------------------
                //


                async.mapSeries(p.images, function(img, cb) {

                    //
                    // UPLOAD THE IMAGE
                    //

                    // NOTE: LOCAL FILE UPLOAD HERE - if you have a URI, perhaps you can programmatically get the image
                    // and then upload it like so. e.g. http.get(uri)

                    var info = url.parse(img),
                        cleanName = sanitize(path.basename(info.pathname)),
                        tmpName = 'TMP-IMG-'+crypto.createHash('md5').update(img).digest('hex')+'-'+cleanName+'.jpg';
                        // tmpName = 'TMP-IMG-'+crypto.createHash('md5').update(img).digest('hex')+'.jpg';
                    
                    var tmpPath = path.join(__dirname, path.sep, 'images', path.sep, tmpName);

                    if (info.protocol == 'http:' || info.protocol == 'https:') {

                        // See if the image was already downloaded
                        if (fs.existsSync(tmpPath)) {

                            //
                            // Cached URL image upload
                            //

                            var cachedFile = new okanjo.FileUpload(tmpPath, tmpName, mime.lookup(tmpPath), {
                                purpose: okanjo.constants.mediaImagePurpose.product
                            });

                            api.postMedia().data(cachedFile).execute(function(err, res) {
                                if (err) { 
                                    cb(null, 239327); 
                                    return;
                                }

                                if(res.status == 500 || res.status == 400) {
                                    cb(null, 239327); 
                                    return;
                                }
                                console.log(' > Uploaded cached image', tmpPath, res.data.id);
                                cb && cb(null, res.data.id);
                            });

                        } else {

                            //
                            // Download it
                            //

                            var proto = info.protocol == 'https:' ? https : http;

                            console.log(img);

                            var dl = fs.createWriteStream(tmpPath);

                            var r = request.get(img).pipe(dl);

                            r.on("error", function(err){
                                console.log('Failed to upload image', err); cb(err); return;
                            });

                            dl.on('finish', function(){
                                //explicitly kill the stream if it hasn't closed yet
                                dl.end();

                                var downloadedFile = new okanjo.FileUpload(tmpPath, tmpName, mime.lookup(tmpPath), {
                                    purpose: okanjo.constants.mediaImagePurpose.product
                                });


                                api.postMedia().data(downloadedFile).execute(function(err, res) {
                                    console.log(res);
                                    if (err) { 
                                        cb(null, 239327); 
                                        return;
                                    }

                                    if(res.status == 500 || res.status == 400) {
                                        cb(null, 239327); 
                                        return;
                                    }
                                    console.log(' > Uploaded url image', img, res.data.id);
                                    cb && cb(null, res.data.id);
                                });
                            });
                        }

                    } else if (info.protocol == null) {

                        //
                        // LOCAL FILE PATH
                        //

                        var file = new okanjo.FileUpload(img, path.basename(img), mime.lookup(img), {
                            purpose: okanjo.constants.mediaImagePurpose.product
                        });

                        api.postMedia().data(file).execute(function(err, res) {
                            if (err) { console.log('Failed to upload image line 970ish', err, res); cb(err); return; }

                            console.log(' > Uploaded local image', img, res.data.id);
                            cb && cb(null, res.data.id);
                        });

                    } else {
                        console.error('Unknown image protocol or is not a HTTP/HTTPS URL or local file path?', img);
                        callback && callback(new Error('Unknown image protocol or is not a HTTP/HTTPS URL or local file path: '+ img));
                    }

                }, function(err, media) {
                    if (err) { callback && callback(); return; }

                    // Media IDs of the uploaded images to use

                    productData.media = media;

                    // Which media ID to use as the default image / tile image
                    productData.thumbnail_media_id = media[0]; // <-- This defaults to the first image index


                    //
                    // SEND TO OKANJO ---------------------------------------------------------------------------------
                    //

                    // IF YOU JUST WANT TO DEBUG:
                    // * Uncomment the callback line below
                    // * Comment-out the api.postProduct call

                    // Just return the product for testing
                    // console.log(productData);
                    // callback && callback(null, productData);

                    // Post the product for REAL
                    
                    api.postProduct().data(productData).execute(function(err, res) {
                        if (err) { callback && callback(err); return; }

                        if (res.status == okanjo.Response.Status.OK) {
                            console.log(' > Uploaded product', res.data.id);
                            console.log('Meta data for product is ' + JSON.stringify(res.data.meta));
                            callback && callback(null, res.data);
                        } else {
                            console.error('Failed to post product. Response:', res);
                            var error = new Error('Product posting failed');
                            error.response = res;
                            callback && callback(error);
                        }
                    });

                });

            });

        })(productData);

    }, function(err, okanjoProducts) {
        callback && callback(null, okanjoProducts);
    });

}


//
// DO THE IMPORT ------------------------------------------------------------------------------------------------------
//



var api = new okanjo.Client(config.api);


// Watch the log event and handle notifications
//api.on('log', function(level, message, args) {
//    // You can filter out lower-level log events that you don't want to see
//    // See okanjo.Client.LogLevel for options
//    console.log('[' + (new Date()) + '] ' + level.name + ': ' + message, args);
//});


/**
 * Stores the default store id of the logged-in user
 * @type {number}
 */
var global_store_id = 0;

api.userLogin().data(config.user).execute(function(err, res) {
    if (err) { console.error(err); return; }

    if (res.status == okanjo.Response.Status.OK) {

        // Use the first store in the list (change this if the user has multiple stores)
        global_store_id = res.data.user.stores[0].id; // TODO: <---- you may need to customize this store id

        // Use this user context with further API calls
        api.userToken = res.data.user_token;

        //
        // BEGIN THE PROCESSING
        //

        getSourceProducts(function(err, data) {
            if (err) { console.error('Failed to retrieve source data', err); return; }

            processAndLoadProducts(data, function(err, products) {
                if (err) { console.error('Failed to map products', err); return; }

                //console.log('COMPLETED OKANJO PRODUCTS:', products);
                console.log('DONE!');
                process.exit(0);

            });
        });

    } else {
        console.error('Failed to login', res);
    }
});