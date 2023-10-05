export async function fetchData(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching data from ${url}: ${error.message}`);
      return null;
    }
  }
  