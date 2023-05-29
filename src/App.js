import React,{useState,useEffect} from 'react';
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core"
import './App.css';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import { sortData, prettyPrintStat } from './util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";


function App() { 
  const [countries,setCountries]=useState([]);
  const [country,setCountry]=useState('worldwide');
  const [countryInfo,setCountryInfo]=useState([]);
  const [tableData,setTableData]=useState([]);
  const [mapCenter,setMapCenter] = useState({lat: 20.5937, lng: 78.9629})
  const [mapZoom,setMapZoom] = useState(3);
  const [mapCountries,setmapCountries] = useState([]);
  const [casesType,setcasesType]=useState("cases");

  //STATE = how to write a variable in REACT 
  useEffect(()=>{
    fetch("https://disease.sh/v3/covid-19/all")
    .then((response)=> response.json())
    .then((data) =>{
      setCountryInfo(data);
    })
  },[])



  useEffect(()=>{ 
    const getCountriesData = async () => {
    await fetch("https://disease.sh/v3/covid-19/countries")
    .then((response) => response.json())
    .then((data) => {
      const countries = data.map((country)=>(
        {
          name:country.country,
          value:country.countryInfo.iso2,
        }
      ));

      const sortedData = sortData(data);
      setTableData(sortedData);

      setmapCountries(data);

      setCountries(countries);

    });

  };
  getCountriesData();
 },[]);
  const onCountryChange = async (event)=>{
      const countryCode= event.target.value;

      const url=
      countryCode === "worldwide"
      ?"https://disease.sh/v3/covid-19/all": `https://disease.sh/v3/covid-19/countries/${countryCode}`;

      await fetch(url)
      .then(response=> response.json())
      .then(data => {
      setCountry(countryCode);
      //All of data 
      //from country reponse
      setCountryInfo(data);

      setMapCenter([data.countryInfo.lat,data.countryInfo.long]);
      setMapZoom(4);
      })
  }
  return (
    <div className="app">
      <div className="app_left">
        <div className="app_header">
          <h1>Covid-19 Tracker</h1>

            <FormControl className="app_dropdown">
              <Select
                variant="outlined"
                onChange={onCountryChange}
                value={country}
              >
                <MenuItem value="worldwide">Worldwide</MenuItem> 

                {/*loop through all the countries and show a drop down menu */}
                {
                  countries.map(country =>(
                  <MenuItem value={country.value}>{country.name}</MenuItem> 
                ))
               }
                {/* <MenuItem value="worldwide">Worldwide</MenuItem>
                <MenuItem value="worldwide">Option2</MenuItem>
                <MenuItem value="worldwide">option3</MenuItem> */}
      
              </Select>
            </FormControl>
          </div>
     
        <div className="app_stats">
            <InfoBox
            isRed
            active={casesType === "cases"}
            onClick={e => setcasesType("cases")} 
            title="Coronavirus cases" cases = {prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)}/>

            <InfoBox 
            active={casesType === "recovered"}
             onClick={e => setcasesType("recovered")} 
            title="Recovered" cases = {prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)}/>

            <InfoBox 
            isRed
            active={casesType === "deaths"}
             onClick={e => setcasesType("deaths")} 
            title="Deaths" cases = {prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)}/> 

            {/*info title="Coronavirus cases"/}
            {/*info title="Coronavirus recovered"*/}
            {/*info title="Coronavirus deaths"*/}
         </div>
          { /*Header*/}
          {/* Title + Select input dropdown field */}

    

          
          <Map
            countries={mapCountries}
            center= {mapCenter}
            zoom = {mapZoom} 
            casesType={casesType}
          />
          {/*map*/}

      </div>
      <Card className="app_right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData}/>
          <h3 className="app_graphtitle">Worldwide new {casesType}</h3>
          <LineGraph 
          className="app__graph"
          casesType={casesType}/>
        </CardContent>

                {/*Table */}          
      </Card>
    </div>

  );
}

export default App;
