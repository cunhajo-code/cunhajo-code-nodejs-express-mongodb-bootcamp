const fs = require('fs');
const superagent = require('superagent');

const readFileProm = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject('File Not found');
      resolve(data);
    });
  });
};

const writeFileProm = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) reject('Could not write the file');
      resolve('success');
    });
  });
};

const getDogPic = async () => {
  try {
    const data = await readFileProm(`${__dirname}/dog.txt`);
    console.log(`Breed: ${data}`);

    // const res = await superagent.get(
    //   `https://dog.ceo/api/breed/${data}/images/random`
    // );

    // return promises instead of result by not specifying await
    const prom1 = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    const prom2 = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    const prom3 = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );

    //create an array of all promise resolutions
    const all = await Promise.all([prom1, prom2, prom3]);

    // use array map to create an array of image files from array of promise resolutions
    const images = all.map((el) => el.body.message);
    console.log(images);

    await writeFileProm('dogImage.txt', images.join('\n'));
    console.log('Random dog image saved to file.');
  } catch (err) {
    console.log(err);
  }
};

getDogPic();

/*
readFileProm(`${__dirname}/dog.txt`)
  .then((data) => {
    console.log(`Breed: ${data}`);
    return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
  })
  .then((res) => {
    console.log(res.body.message);
    return (
      writeFileProm('dogImage.txt', res.body.message)
        // fs.writeFile('dogImage.txt', res.body.message, (err) => {
        //   if (err) return console.log(err.message);
        //   console.log('Random dog image saved to file.');
        // });
        .then(() => {
          console.log('Random dog image saved to file.');
        })
    );
  })
  .catch((err) => {
    console.log(err);
  });
  */
