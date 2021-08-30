const fs = require('fs');

const axios = require('axios');
const xmlReader = require('xml-reader');
const xmlQuery = require('xml-query');

const getData = async (url) => {
    try {
        const result = await axios.get(url, { timeout: 20000 })
        return result;
    } catch (err) {
        throw err;
    }
}

getData('https://repos.accor.com/ota/content.xml').then(res => {
        const hotelXML = xmlReader.parseSync(res.data);
        const xq = xmlQuery(hotelXML);

        const hotelsNode = xq.find('hotels');

        const allHotelXq = hotelsNode.children();

        const allHotelXmls = allHotelXq.map(node => {
            return xmlQuery(node).find('file').text();
        });

        // console.log(allHotelXmls);

        const allXMLPaths = allHotelXmls.map(el => `https://repos.accor.com/ota/${el}`);

        // console.log(allXMLPaths);

        getData(allXMLPaths[0]).then(data => {
            const hotelData = data.data;
            console.log(hotelData);
        })

        // allXMLPaths.forEach(element => {
        //     const dataXml = await axios.get(element);
        //     console.log(dataXML.data);
        // });

    }).catch(err => console.log(`Error: ${err}`));

