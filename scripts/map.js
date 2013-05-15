//variables globals
var map
var markers
var strategy
var clusters
var pointFeatures = [];
var selectControl
var selectedFeature
//init
function init(){
	var proj='EPSG:25831';
	var resoluciones =[529.16772500211675,264.58386250105838,211.66709000084668,105.83354500042334,52.916772500211671,26.458386250105836,13.229193125052918,6.6145965625264589,5.2916772500211673,3.9687579375158752,2.6458386250105836,1.3229193125052918,0.52916772500211673,0.26458386250105836,0.13229193125052918];
	var layerResolutions = [529.16772500211675,264.58386250105838,211.66709000084668,105.83354500042334,52.916772500211671,26.458386250105836,13.229193125052918,6.6145965625264589,5.2916772500211673,3.9687579375158752,2.6458386250105836,1.3229193125052918,0.52916772500211673,0.26458386250105836,0.13229193125052918];
	var extentInicial = new OpenLayers.Bounds([562130, 4407407, 615999, 4440533]);
	var baseReferencia = new OpenLayers.Layer.ArcGISCache("Base referencia", "http://ide.cime.es/Cache/IDEMenorca/baserefcatxe/_alllayers", {
		projection: new OpenLayers.Projection('EPSG:25831')
		, maxExtent:new OpenLayers.Bounds(562130, 4407407, 615999, 4440533)
		, useArcGISServer:false
		, units: "m"
		, type: "jpg"
		, tileSize:new OpenLayers.Size(256,256)
		, tileOrigin: new OpenLayers.LonLat(240000, 4698000)
		, transitionEffect: 'resize'
		, buffer:1
		, resolutions: layerResolutions
	});
	//opcions del mapa
	var options = { 
			maxExtent: new OpenLayers.Bounds(562130, 4407407, 615999, 4440533)
			, restrictedExtent: new OpenLayers.Bounds(562130, 4397407, 615999, 4440533)
			, projection: new OpenLayers.Projection('EPSG:25831')
			, displayProjection: new OpenLayers.Projection('EPSG:25831')
			, resolutions: resoluciones
			, controls: [		                
						new OpenLayers.Control.Navigation(), 
						new OpenLayers.Control.PanZoom(),
						new OpenLayers.Control.ArgParser(),
						new OpenLayers.Control.Panel({displayClass:"panelInferior"}),
						new OpenLayers.Control.LayerSwitcher(),
						new OpenLayers.Control.Panel(),
						new OpenLayers.Control.MousePosition(
							{
								formatOutput:function(lonLat)
											{
												var position = new OpenLayers.LonLat(lonLat.lon, lonLat.lat);
												var position4326 = new OpenLayers.LonLat(lonLat.lon, lonLat.lat);
												position4326.transform(new OpenLayers.Projection("EPSG:25831" ), new OpenLayers.Projection("EPSG:4326"));
												return " x=" + position4326.lon.toFixed(6) + ", y=" + position4326.lat.toFixed(6) + " / ETRS89: x=" + parseInt(position.lon) + ", y=" + parseInt(position.lat) + "</div>";   
											}
							}
						),
						new OpenLayers.Control.ScaleLine({maxWidth:200})
						]
		}
	
	
	//Definim tres colors que serviran per donar estil als clusters 
	// depenent del nombre de features que contenguin
	 var colors = {
                low: "rgb(181, 226, 140)", 
                middle: "rgb(241, 211, 87)", 
                high: "rgb(253, 156, 115)"
            };
	// Definim tres regles per donar estils als clusters segons el nombre de features que contenguin
            var iconRule = new OpenLayers.Rule({
                filter: new OpenLayers.Filter.Comparison({
                   //si contenen menys de dues features mostram la seva icona
				   type: OpenLayers.Filter.Comparison.LESS_THAN,
                    property: "count",
				   value: 2
                }),
                symbolizer: {
                    fillColor: colors.low,
                    fillOpacity: 0.9, 
                    strokeColor: colors.low,
                    strokeOpacity: 0.5,
                    strokeWidth: 12,
                    pointRadius: 10,
                    //label: "${count}",
                    labelOutlineWidth: 1,
                    fontColor: "#ffffff",
                    fontOpacity: 0.8,
                    fontSize: "12px",
					externalGraphic: "http://www.openlayers.org/dev/img/marker.png"
                }
            });	
	
            var lowRule = new OpenLayers.Rule({
                filter: new OpenLayers.Filter.Comparison({
                   //si contenen menys de 15
				   type: OpenLayers.Filter.Comparison.LESS_THAN,
                    property: "count",
                   
					value: 15
                }),
                symbolizer: {
                    fillColor: colors.low,
                    fillOpacity: 0.9, 
                    strokeColor: colors.low,
                    strokeOpacity: 0.5,
                    strokeWidth: 12,
                    pointRadius: 10,
                    label: "${count}",
                    labelOutlineWidth: 1,
                    fontColor: "#ffffff",
                    fontOpacity: 0.8,
                    fontSize: "12px"
                }
            });
            var middleRule = new OpenLayers.Rule({
                filter: new OpenLayers.Filter.Comparison({
				//si contenen entre 15 i 50 features
                    type: OpenLayers.Filter.Comparison.BETWEEN,
                    property: "count",
                    lowerBoundary: 15,
                    upperBoundary: 50
                }),
                symbolizer: {
                    fillColor: colors.middle,
                    fillOpacity: 0.9, 
                    strokeColor: colors.middle,
                    strokeOpacity: 0.5,
                    strokeWidth: 12,
                    pointRadius: 15,
                    label: "${count}",
                    labelOutlineWidth: 1,
                    fontColor: "#ffffff",
                    fontOpacity: 0.8,
                    fontSize: "12px"
                }
            });
            var highRule = new OpenLayers.Rule({
                filter: new OpenLayers.Filter.Comparison({
				//si contenen mes de 50 features
                    type: OpenLayers.Filter.Comparison.GREATER_THAN,
                    property: "count",
                	value: 50
                }),
                symbolizer: {
                    fillColor: colors.high,
                    fillOpacity: 0.9, 
                    strokeColor: colors.high,
                    strokeOpacity: 0.5,
                    strokeWidth: 12,
                    pointRadius: 20,
                    label: "${count}",
                    labelOutlineWidth: 1,
                    fontColor: "#ffffff",
                    fontOpacity: 0.8,
                    fontSize: "12px"
                }
            });
            
            // Creem un estil que utilitza les regles anteriorment creades
            var style2 = new OpenLayers.Style(null, {
                rules: [lowRule, middleRule, highRule,iconRule]
            }); 
			
			//creem la capa clusters
			clusters = new OpenLayers.Layer.Vector("Clusters", {
					//estrategia utilitzada: animatedCluster
					strategies: [
						new OpenLayers.Strategy.AnimatedCluster({
							distance: 45,
							animationMethod: OpenLayers.Easing.Expo.easeOut,
							animationDuration: 20
						})
					],
				//estil per defecte, style2
				styleMap: new OpenLayers.StyleMap({
					"default": style2,
					"select": {
						fillColor: "#8aeeef",
						strokeColor: "#32a8a9"
					}
				})
			
			});
	//creem el mapa 
    map = new OpenLayers.Map("mapa",options);
	//agegim les capes al mapa
	map.addLayers([baseReferencia,clusters]);
	map.zoomToExtent(extentInicial);
	//cridam la funció que agafarà els punts de la BD
	marcadors_on();
	//definim el centre del mapa després d'afegir els cluster, així es col·loquen (si no ho centrem després, al mapa només apareixerà un punt)
	map.setCenter(new OpenLayers.LonLat(590500,4422500), 1);
	// agegim un control per poder seleccionar els punts, cridem la funció openEvent
	selectControl = new OpenLayers.Control.SelectFeature(clusters,{onSelect: openEvent, onUnselect: closeEvent}
	);
	map.addControl(selectControl);
	selectControl.activate();
	

}
function openEvent(feature) {
            selectedFeature = feature;
			//construim la llista amb els noms de tots els punts dins el cluster
			var llistaItems = "";
			for (var i=0; i<selectedFeature.cluster.length; i++)
			{
				llistaItems += "Nom de platja: " + selectedFeature.cluster[i].data.nom + "<br>";
			}
			//creem un popup amb la llista
            popup = new OpenLayers.Popup.FramedCloud("chicken", 
                                     feature.geometry.getBounds().getCenterLonLat(),
                                     new OpenLayers.Size(500,600),
                                     "Items: " + selectedFeature.cluster.length + "<br>" + llistaItems,
                                     null, true, onPopupClose);
            popup.autoSize = true;
			feature.popup = popup;
			
            map.addPopup(popup);
        }
        function closeEvent(feature) {
            map.removePopup(feature.popup);
            feature.popup.destroy();
            feature.popup = null;
        }    
		function onPopupClose(evt) {
            selectControl.unselect(selectedFeature);
        }

function posaFeature(x, y, idPlatja, nomPlatja, tipusPlatja) {
	//creem punts geometrics
	var pointGeometry = new OpenLayers.Geometry.Point(x, y);
	//creem features a partir dels punts geometrics
	var pointFeature = new OpenLayers.Feature.Vector(pointGeometry, {id:idPlatja,nom:nomPlatja,tipus:tipusPlatja});
	//afegim les features a la matriu pointFeature
	pointFeatures.push(pointFeature);
	//pintem els clusters amb les features de dins la matriu pointFeatures
	clusters.addFeatures(pointFeatures);
}	



