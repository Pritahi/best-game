export const CHARTS = [
  {name:'Verdigris Reach',tone:'#38b9a1',rifts:[['North Shoal',280,300],['Glasswater',600,545],['Moss Lantern',920,320]],eels:1,spitter:false,sentinel:0,currents:[],rescues:[[460,650]]},
  {name:'Ember Straits',tone:'#d98148',rifts:[['Cinder Gate',250,345],['Brass Current',600,535],['Ashen Bell',950,345]],eels:1,spitter:true,sentinel:0,currents:[],rescues:[[405,620],[800,615]]},
  {name:'Violet Gyre',tone:'#a590df',rifts:[['The Widdershins',280,325],['Blue Maw',600,565],['Vesper Eye',920,325]],eels:1,spitter:false,sentinel:1,currents:[[445,425,125],[770,440,105]],rescues:[[360,650]]},
  {name:'Pale Meridian',tone:'#b9e8e8',rifts:[['West Ward',345,390,2],['East Ward',855,390,2]],eels:2,spitter:true,sentinel:0,currents:[[460,440,105],[740,440,105]],rescues:[[260,650],[940,650]],sovereign:['The Sovereign Rift',600,390]}
];
export const TOTAL_CHARTS=CHARTS.length;
// Campaign objectives: nine ordinary rifts, two two-stage wards, then the sovereign.
export const TOTAL_RIFTS=14;
