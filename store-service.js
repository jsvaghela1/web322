const fs = require('fs').promises;
const path = require('path');

let items = [];
let categories = [];

const initialize = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8')
      .then(data => {
        items = JSON.parse(data);
        return fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8');
      })
      .then(data => {
        categories = JSON.parse(data);
        resolve('Initialization successful');
      })
      .catch(err => {
        reject(`Error initializing data: ${err.message}`);
      });
  });
};

const getAllItems = () => {
  return new Promise((resolve, reject) => {
    if (items.length > 0) {
      resolve(items);
    } else {
      reject('No results returned');
    }
  });
};

const getPublishedItems = () => {
  return new Promise((resolve, reject) => {
    const publishedItems = items.filter(item => item.published);
    if (publishedItems.length > 0) {
      resolve(publishedItems);
    } else {
      reject('No results returned');
    }
  });
};

const getCategories = () => {
  return new Promise((resolve, reject) => {
    if (categories.length > 0) {
      resolve(categories);
    } else {
      reject('No results returned');
    }
  });
};

const addItem = (itemData) => {
  return new Promise((resolve, reject) => {
    if (itemData.published === undefined) {
      itemData.published = false;
    } else {
      itemData.published = itemData.published === 'true' || itemData.published === true;
    }
    itemData.id = items.length + 1;
    items.push(itemData);
    resolve(itemData);
  });
};

const getItemsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    const filteredItems = items.filter(item => item.category === parseInt(category));
    if (filteredItems.length > 0) {
      resolve(filteredItems);
    } else {
      reject('No results returned');
    }
  });
};

const getItemsByMinDate = (minDateStr) => {
  return new Promise((resolve, reject) => {
    const filteredItems = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));
    if (filteredItems.length > 0) {
      resolve(filteredItems);
    } else {
      reject('No results returned');
    }
  });
};

const getItemById = (id) => {
  return new Promise((resolve, reject) => {
    const foundItem = items.find(item => item.id === parseInt(id));
    if (foundItem) {
      resolve(foundItem);
    } else {
      reject('No result returned');
    }
  });
};

module.exports = {
  initialize,
  getAllItems,
  getPublishedItems,
  getCategories,
  addItem,
  getItemsByCategory,
  getItemsByMinDate,
  getItemById
};
