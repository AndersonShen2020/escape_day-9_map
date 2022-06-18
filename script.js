console.clear();
// 要同時渲染地圖跟資料 ==> 所以必須先抓到資料，混合後再進行渲染

// 地圖長寬及縮放比
const map_Width = 800;
const map_Height = 800;
const scale_Size = 10000;

// API
const county_geomap_api =
  "https://hexschool.github.io/tw_revenue/taiwan-geomap.json";
const county_revenue_api =
  "https://hexschool.github.io/tw_revenue/tw_revenue.json";

// 地圖圖層設定
let svg = d3
  .select("#canvas")
  .append("svg")
  .style("height", map_Width)
  .style("width", map_Height);

// 接續地圖圖層設定，製作文字區塊
svg
  .append("text")
  .attr("class", "city")
  .attr("x", map_Width * 0.75)
  .attr("y", map_Height * 0.5)
  .style("fill", "#f3dc71")
  .style("font-size", "1.5rem");

// d3.select("#canvas").on("mousemove", function (e) {
//   tooltip.style("left", e.layerX + 20).style("top", e.layerY + 35);
// });

// 地圖繪製
const getMap = d3.json(county_geomap_api, d => d.data);
const getRevenue = d3.json(county_revenue_api, d => d.data);

// 拿到 2 種資料後，同時渲染畫面
Promise.all([getMap, getRevenue]).then(
  values => {
    // 取得 API 資料，進行資料處理
    
    // mapData
    // geometry 渲染這塊地區的資料
    // properties 地區屬性
    const counties = topojson.feature(values[0], values[0].objects["COUNTY_MOI_1090820"]).features;
    // 收入資料
    const revenue = values[1][0].data;

    // console.log(counties);
    // console.log(revenue);

    // 將收入資料帶入到 mapData 中
    revenue.forEach(element => {
      let index = counties.findIndex(country => country.properties.COUNTYNAME === element.city)
      
      counties[index].properties.rank = element.rank;
      counties[index].properties.revenue = element.revenue;
    });

    const colorScale = d3.scaleLinear()
      .domain([
        d3.min(revenue, d => d.rank),
        d3.max(revenue, d => d.rank)
      ])
      .range([
        '#ec595c', // <= lower bound of our color scale
        '#bcafb0'  // <= upper bound of our color scale
      ]);
    
    const path = d3.geoPath().projection;
    const projection = d3.geoMercator().center([121, 24]).scale(scale_Size);
    
    const geoPath = svg
      .selectAll(".geo-path")
      .data(counties)
      .join("path")
      .attr("class", "geo-path")
      .attr("d", path(projection))
      .style("fill", d => d?.properties?.rank ? colorScale(d.properties.rank) : "#d6d6d6")
      .style("stroke", "#3f2ab2")
      .on("mouseover", function (e) {
        d3.select(this).style("stroke", "white");
        d3.select(this).select(function (d) {
          d3.select(".city").html(() => d.properties.revenue ? `${d.properties.COUNTYNAME} , ${d.properties.revenue}` : `${d.properties.COUNTYNAME}`);
          // d3.style("display", "block");
        });
      })
      .on("mouseleave", function (e) {
        d3.select(this).style("stroke", "none");
        // d3.style("display", "none");
      });
  }
)

// getMap.then((data) => {
//   const counties = topojson.feature(data, data.objects.COUNTY_MOI_1090820);
//   const projection = d3.geoMercator().center([121, 24]).scale(scale_Size);
//   const path = d3.geoPath().projection;

//   const geoPath = svg
//     .selectAll(".geo-path")
//     .data(counties.features)
//     .join("path")
//     .attr("class", "geo-path")
//     .attr("d", path(projection))
//     .style("fill", "#d6d6d6")
//     .style("stroke", "#3f2ab2");
// });

// d3.json(county_geomap_api).then((data) => {
//   const counties = topojson.feature(data, data.objects.COUNTY_MOI_1090820);
//   const projection = d3.geoMercator().center([121, 24]).scale(scale_Size);
//   const path = d3.geoPath().projection;

//   const geoPath = svg
//     .selectAll(".geo-path")
//     .data(counties.features)
//     .join("path")
//     .attr("class", "geo-path")
//     .attr("d", path(projection))
//     .style("fill", "#d6d6d6")
//     .style("stroke", "#3f2ab2")
//     .on("mouseover", function (e) {
//       // d3.select(this).style("stroke", "white");
//       // d3.select(this).select(function (d) {
//       //   tooltip.select("text").html(d.properties.COUNTYNAME);
//       //   tooltip.style("display", "block");
//       // });
//     })
//     .on("mouseleave", function (e) {
//       // d3.select(this).style("stroke", "none");
//       // tooltip.style("display", "none");
//     });
// });