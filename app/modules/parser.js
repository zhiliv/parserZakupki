'use strict';

let countOnPage = 50;
/**
 * Модуль для  выполнения парсинга
 * @member parser
 */

//подулючение модля с ффункциями для парсинга
const fn = require('./funcParse');

let arr = []
let ind = 0;
let lengthPages = 1;
/**
 * Функция запуска парсинга
 * @memberof parser
 * @async
 */
module.exports.start = async () => {
  let e;
  let arrErr = [];
  //стартовая ссылка
  let url = `https://old.zakupki.mos.ru/#/sku?s.costPerUnitLessEqual=5000&s.productionDirectoryPaths.0=.1.72095941.&s.state=actual&s.entityStateIn.0=1&v.ps=${countOnPage}&v.s=relevance&v.sd`;

  //переменная для хранения вкладки
  var tab;
  //создание новой вкладки
  await fn.newTab().then(res => {
    tab = res;
  });
  //открытие страницы во вкладке
  await fn.openTab(tab, url).then(res => {
    res.err ? (err = res.err) : (tab = res.data);
  });

  //цикл для обхода всех страниц
  while (true) {
    await tab.wait(2000)
    //переменная для зранения текста ошибки
    let err = null;
    let html;
    if (!err) {
      //получение BODY у страницы
      await fn.getDataBody(tab, ind).then(res => {
        //проверка на наличие ошибок
        res.err ? (err = res.err) : (html = res.data);
      });
    }
    if (!err) {
      if (ind == 0) {
        //получение найденных значений
        lengthPages = await fn.getLengthListPage(html);
        lengthPages = Math.ceil(lengthPages / countOnPage);
        console.log("TCL: module.exports.start -> lengthPages", lengthPages)
      }
      try {
        await tab.click(`.k-i-arrow-e`)
      } catch (err) {
        console.log("An error occured:", err)
      }
      fn.getListProduct(html)
      ind++
      if (ind == lengthPages+1) {
        console.log("Длина", arr.length)
        fn.saveToFile()
        break
      }
      //fn.getListProduct(html)
    }
  }
};
module.exports.arr = arr;