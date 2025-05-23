const fs = require("fs");
const http = require("http");
const url = require("url");

const slugify = require("slugify");

const replaceTemplate = require("./modules/replaceTemplate");

// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// // console.log(textIn);

// const textOut = `This what we know about the advocado: ${textIn}.\nCreated on ${new Date(
//   Date.now()
// ).toLocaleDateString()}`;
// fs.writeFileSync("./txt/output.txt", textOut);
// console.log(textOut);

// non blocking asynchronous way
// fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
//     console.log(data2);
//     fs.readFile("./txt/append.txt", "utf-8", (err, data3) => {
//       console.log(data3);
//       fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
//         console.log("File has been written");
//       });
//     });
//   });
// });

// console.log("Will read file!");

//
// HTTP Server

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data);

const templOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);

const templCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);

const templProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);

const productSlugs = dataObj.map((el) =>
  slugify(el.productName, { lower: true })
);
console.log(productSlugs);

const server = http.createServer((req, res) => {
  //   console.log(req.url);
  //   console.log(url.parse(req.url, true));
  //   const pathName = req.url;
  const { query, pathname } = url.parse(req.url, true);

  //Overview
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "Content-type": "text/html" });

    const cardsHtml = dataObj
      .map((el) => replaceTemplate(templCard, el))
      .join("");
    // console.log(cardsHtml);
    const output = templOverview.replace(/{%PRODUCT_CARDS%}/g, cardsHtml);
    res.end(output);

    //Product
  } else if (pathname === "/product") {
    res.writeHead(200, { "Content-type": "text/html" });
    const product = dataObj[query.id];

    const output = replaceTemplate(templProduct, product);
    res.end(output);

    //API
  } else if (pathName === "/api") {
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(data);

    //Not found
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
    });
    res.end("<h1>Page not found!</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening for request on port 8000");
});
