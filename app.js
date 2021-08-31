const fs = require('fs');

const axios = require('axios');
const xmlReader = require('xml-reader');
const xmlQuery = require('xml-query');

const allHotelsObjects = {};

const getData = async (url) => {
    try {
        const result = await axios.get(url, { timeout: 20000 })
        return result;
    } catch (err) {
        return err;
    }
}

const getAllHotelData = async () => {
    try {
        const contentResponse = await getData('https://repos.accor.com/ota/content.xml');

        const hotelXML = xmlReader.parseSync(contentResponse.data);
        const xq = xmlQuery(hotelXML);

        const hotelsNode = xq.find('hotels');

        const allHotelXq = hotelsNode.children();

        const allHotelXmls = allHotelXq.map(node => {
            return xmlQuery(node).find('file').text();
        });

        const allXMLPaths = allHotelXmls.map(el => `https://repos.accor.com/ota/${el}`);

        console.log(`Records to process: ${allXMLPaths.length}`)

        for (const [index, record] of allXMLPaths.entries()) {
            if ((index+1)%10 === 0) {
                console.log(index+1);
            }

            const hotelXMLResponse = await getData(record);

            if (hotelXMLResponse.status === 200 || hotelXMLResponse.status === 304) {
                const hotelDataXML = xmlReader.parseSync(hotelXMLResponse.data);
                const hotelsXMLQuery = xmlQuery(hotelDataXML);

                const hotelContentNode = hotelsXMLQuery.find('HotelDescriptiveContent');
                const hotelCode = hotelContentNode.attr() ? hotelContentNode.attr().HotelCode : `Recheck: ${record}`;
                const meetingRoomsNode = hotelsXMLQuery.find('MeetingRooms');
                const allMeetingRooms = meetingRoomsNode.children();

                const currentMeetingRoomList = allMeetingRooms.map(node => {
                    return {
                        roomId: xmlQuery(node).attr('ID'),
                        roomName: xmlQuery(node).attr('RoomName')
                    }
                })

                const seen = new Set();
                const currentMeetingRoomListFiltered = currentMeetingRoomList.filter(el => {
                    const dup = seen.has(el.roomId);
                    seen.add(el.roomId);
                    return !dup;
                })

                allHotelsObjects[hotelCode] = currentMeetingRoomListFiltered;
            } else {
                console.log(`Couldn't get response for ${record}`);
            }
        }

        // console.log(JSON.stringify(allHotelsObjects));

        fs.writeFileSync('allData.json', JSON.stringify(allHotelsObjects));
    } catch (err) {
        console.log(`Fatal Error: ${err}`);
    }
}

getAllHotelData();

