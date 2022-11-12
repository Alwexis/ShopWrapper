/* 
? Shop Wrapper
* Se utilizará para mostrar productos de las grandes tiendas chilenas; Falabella, Ripley, Paris y
* Mercado Libre CL.

* Este archivo será el componente que se encargará de Wrapear los productos de las tiendas. Propósito
* únicamente para el backend.
*/

// Importar librerías
import * as puppeteer from 'puppeteer';

export class ShopWrapper {
    constructor() {
    }

    async getProducts(shop, params) {
        switch (shop) {
            case 'Falabella':
                Falabella.getProducts(params);
                break;
            default:
                break;
        }
    }

}

export class Falabella {
    constructor() {}

    static async getProducts(params) {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        console.log('Abriendo navegador...\n');
        page.setDefaultTimeout(60000);
        page.setDefaultNavigationTimeout(60000);
        if (params) {
            await page.goto('https://www.falabella.com/falabella-cl');
            await page.waitForSelector('#testId-HamburgerBtn-toggle');
            await page.click('#testId-HamburgerBtn-toggle');
            console.log('Cargando categorías...\n');
            // Obteniendo categorias
            const categories = await page.evaluate((params) => {
                let categories = [];
                const nodeList = document.getElementsByClassName('Categories-module_categoryWrapper__19-r8');
                [...nodeList].forEach(element => {
                    let category = element.children[0].children[0].innerText.replace('NUEVO', '').trim().toLowerCase();
                    if (params.category === null) {
                        if (!category.includes('nuevo') && !category.includes('otras categorías') && !category.includes('liquidación')) {
                            categories.push(category);
                        }
                    } else {
                        if (category.includes(params.category.toLowerCase())) {
                            categories.push(category);
                            element.click();
                            document.getElementsByClassName('TaxonomyMobile-module_verTodo__1WS0N')[0].click()
                            return;
                        }
                    }
                });
                return categories.join(', ');
            }, params);
            // Obteniendo productos
            console.log('Cargando productos...\n');
            await page.waitForSelector('#testId-searchResults-products');
            const products = await page.evaluate(() => {
                let productList = [];
                const productsNodeList = document.getElementsByClassName('grid-pod');
                [...productsNodeList].forEach(product => {
                    const productName = product.getElementsByClassName('pod-subTitle')[0].innerText;
                    const productMark = product.getElementsByClassName('pod-title')[0].innerText;
                    const productSeller = product.getElementsByClassName('pod-sellerText')[0].innerText.replace('Por ', '');
                    // Prices
                    const prices0 = product.getElementsByClassName('prices-0')[0];
                    const productInternetPrice = prices0.getAttribute('data-internet-price') || prices0.getAttribute('data-event-price') || 'N/A';
                    const prices1 = product.getElementsByClassName('prices-1')[0];
                    const productNormalPrice = prices1.getAttribute('data-normal-price') || 'N/A';
                    productList.push({ nombre: productName, marca: productMark, vendedor: productSeller, precioInternet: productInternetPrice, precioNormal: productNormalPrice });
                })
                return productList;
            });
            // Mostrar productos
            console.table(products);
            // Cerrando navegador
            console.log('\nCerrando navegador...');
            page.close();
            browser.close();
        } else { console.log('Ingresa parámetros; Search-Query, Category.') }
    }

    static getCategories() {
        let categories = [];
        // Convierto el NodeList en un Array con el spread operator (...).
        [...document.querySelectorAll('.Categories-module_categoryWrapper__19-r8')].forEach(element => {
            let category = element.children[0].children[0].innerText.replace('NUEVO', '').trim().toLowerCase();
            if (!category.includes('nuevo') && !element.includes('otras categorías') && element.includes('liquidación')) {
                categories.push(category);
            }
        });
        return categories;
    }
}

await Falabella.getProducts({ category: 'celulares'});
