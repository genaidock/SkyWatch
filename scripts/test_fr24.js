

async function testFR24() {
  const callsign = 'BAW119'; // example
  const url = `https://api.flightradar24.com/common/v1/flight/list.json?query=${callsign}&fetchBy=flight&page=1&limit=25`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    const data = await res.json();
    console.log(JSON.stringify(data.result.response.data, null, 2));
  } catch(e) {
    console.error(e);
  }
}

testFR24();
