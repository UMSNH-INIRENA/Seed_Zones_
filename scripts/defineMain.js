/* 
 * Define the JavaScript functions used to create the structure and widgets
 */

define([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/GroupLayer",
    "esri/layers/FeatureLayer",
    "esri/widgets/LayerList",
    "esri/layers/MapImageLayer",
    "esri/layers/support/Sublayer",
    "esri/layers/FeatureLayer",
    "esri/widgets/Print",
    "esri/layers/VectorTileLayer",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Search",
	"esri/widgets/Legend",
    "esri/widgets/DistanceMeasurement2D",
    "esri/widgets/AreaMeasurement2D",
	"esri/widgets/Swipe",
	"esri/widgets/ScaleBar",
	"esri/symbols/PictureMarkerSymbol",
	"esri/symbols/SimpleFillSymbol",
	"esri/layers/TileLayer"
], function (Map, MapView, GroupLayer, FeatureLayer, LayerList, MapImageLayer, Sublayer, FeatureLayer, Print, VectorTileLayer, BasemapGallery, Search, Legend,DistanceMeasurement2D, AreaMeasurement2D,Swipe,ScaleBar,PictureMarkerSymbol,SimpleFillSymbol,TileLayer){

    var map, view, xy;
    var basemapGallery, layerList, print, legend, swipe;
	var activeWidget;

	return {
		mapInit: mapInit,
        fullExtent: fullExtent,
    };

    /* Initialize the map and all layers and functionality*/
    function mapInit() {
        ///*Create a new map
        map = new Map({
            basemap: "hybrid",
            layers: []
        });

        //Create a new map view and add the map to it
        xy = [-105, 24.3];
        view = new MapView({
            center: xy,
            zoom: 6,
            container: "viewDiv",
            map: map,
            popup: {
                dockEnabled: true,
                dockOptions: {
                    position: "bottom-left",
                    breakpoint: false
                }
            }
        });	
        // Make the layers
        layerInit();
		
        // Make the groups and add to map
        makeGroups();
		
        //When the view UI is loaded, add the buttons
        view.when(function () {
            view.ui.add("topbar", "top-left");
			view.ui.add("titleDiv", "top-right");
			view.ui.add("btn_logo", "bottom-left");		

            addLayerList();
			SearchFutureEcosystem();
			SearchCurrentEcosystem();
			
			location_search();
			addMouseCoord();
            addExtentButton();				
            addBasemapGallery();
            addPrintButton();
			addScalebar();
			addMeasurement();		
		});
	}
	function layerInit() {
	lyr2025 = featureInit ('https://maps.forsite.ca/server/rest/services/Hosted/Mexico_2025/FeatureServer', "Near Future climate (2025)")
	lyr2025.visible = false;
	lyr1991 = featureInit ("https://maps.forsite.ca/server/rest/services/Hosted/Mexico_1961_1990/FeatureServer","Reference climate (1961-1990; for which seeds are adapted)")
	lyr1991.visible = false;
	}
	
	function popupTable(lyr) {
		lyr.load().then(function() {
        lyr.popupTemplate = lyr.createPopupTemplate();
	  });
	 }

	function location_search(){
        var location_search = new Search({
          view: view,
		  container: "locationDiv",
        });		
	}
	function featureInit_complex(src, expression,name,renderer){
		return new FeatureLayer({
		url: src,
		definitionExpression: expression,
		title: name,
		renderer: renderer,
		opacity: 1,
		visibilityMode: "independent",
		});
	}
    function featureInit(src, name){
        return new FeatureLayer({
            url: src,
            title: name,
            opacity: 1,
            visibilityMode: "independent",			
        });
    }
	function ImgInit (src){
		return new MapImageLayer({
			url: src,
		});
	}
	function makeGroups() {
		map.add(lyr2025);	
		map.add(lyr1991);		
    };
	
	function updateKey (list){	
		var listLength = list.length;
		var newlist = new Array ();
		for (var i = 0; i < listLength; i++){
			newlist.push (list[i][1].replace(/ /g,"_"));
			};
		return newlist
	 };
 
    /* Initialize a Tile Layer*/
    function rasterInit(src) {
        return new TileLayer({
        });
    }
    /* Initialize a Vector Tile Layer*/
    function vectorInit(src, name) {
        return new VectorTileLayer({
                    url: src
        });
    }
	
	function addMeasurement() {
        document
          .getElementById("distanceButton")
          .addEventListener("click", function() {
            setActiveWidget(null);
            if (!this.classList.contains("active")) {
              setActiveWidget("distance");
            } else {
              setActiveButton(null);
            }
          });

        document
          .getElementById("areaButton")
          .addEventListener("click", function() {
            setActiveWidget(null);
            if (!this.classList.contains("active")) {
              setActiveWidget("area");
            } else {
              setActiveButton(null);
            }
          });

        function setActiveWidget(type) {
          switch (type) {
            case "distance":
              activeWidget = new DistanceMeasurement2D({
                view: view
              });

              // skip the initial 'new measurement' button
              activeWidget.viewModel.newMeasurement();

              view.ui.add(activeWidget, "manual");
              setActiveButton(document.getElementById("distanceButton"));
              break;
            case "area":
              activeWidget = new AreaMeasurement2D({
                view: view
              });

              // skip the initial 'new measurement' button
              activeWidget.viewModel.newMeasurement();

              view.ui.add(activeWidget, "manual");
              setActiveButton(document.getElementById("areaButton"));
              break;
            case null:
              if (activeWidget) {
                view.ui.remove(activeWidget);
                activeWidget.destroy();
                activeWidget = null;
              }
              break;
          }
        }
        function setActiveButton(selectedButton) {
          // focus the view to activate keyboard shortcuts for sketching
          view.focus();
          var elements = document.getElementsByClassName("active");
          for (var i = 0; i < elements.length; i++) {
            elements[i].classList.remove("active");
          }
          if (selectedButton) {
            selectedButton.classList.add("active");
          }
        }		
	}
	
    function SearchFutureEcosystem() {
        document
          .getElementById("searchFutureButton")
          .addEventListener("click", function() {
            setActiveWidget(null);
            if (!this.classList.contains("active")) {
              setActiveWidget("search_future");
            } else {
              setActiveButton(null);
            }
          });
		function setActiveWidget (type) {
          switch (type) {
            case "search_future":
		    lyr1991.definitionExpression = '';
			lyr2025.definitionExpression = '';
			lyr1991.visible = true;
			lyr2025.visible = false;
			view.on("click", function (event) {
				 screenPoint = {
				   x: event.x,
				   y: event.y
				 };
			activeWidget =  SearchFuture(screenPoint,lyr1991,lyr2025) 			
            setActiveButton(document.getElementById("searchButton"))
					
			});		  
              break;           

            case null:
              if (activeWidget) {
                view.ui.remove(activeWidget);
                activeWidget.destroy();
                activeWidget = null;
              }
              break;          
		  function SearchFuture(Screen_points,lyr1991,lyr2025){
			view.hitTest(Screen_points).then(function (response) {
			  if (response.results.length) {
			    var graphic = response.results.filter(function (result) {
				// check if the graphic belongs to the layer of interest
				return result.graphic.layer === lyr1991;
			   })[0].graphic;
			   // do something with the result graphic
			   console.log("Gridecode: " + graphic.attributes.gridcode);
			   //lyr1991.visible = false;
			   lyr2025.definitionExpression =  "gridcode = " + graphic.attributes.gridcode ;
			   lyr1991.definitionExpression =  "gridcode = " + graphic.attributes.gridcode ;
			   lyr1991.opacity = 1;
			   lyr1991.visible = false;
			   lyr2025.visible = true;	
			   document.getElementById("infoText").innerHTML = 'Gridcode: ' + graphic.attributes.gridcode;
				}
			 });			  
		  }
		  
		  }
        }
		function setActiveButton(selectedButton) {
          var elements = document.getElementsByClassName("active");
          for (var i = 0; i < elements.length; i++) {
            elements[i].classList.remove("active");
          }
          if (selectedButton) {
            selectedButton.classList.add("active");
          }
        }	
	}

    function SearchCurrentEcosystem() {
        document
          .getElementById("searchCurrentButton")
          .addEventListener("click", function() {
            setActiveWidget(null);
            if (!this.classList.contains("active")) {
              setActiveWidget("search_current");
            } else {
              setActiveButton(null);
            }
          });
		function setActiveWidget (type) {
          switch (type) {
            case "search_current":
		    lyr1991.definitionExpression = '';
			lyr2025.definitionExpression = '';
			lyr1991.visible = false;
			lyr2025.visible = true;
			view.on("click", function (event) {
				 screenPoint = {
				   x: event.x,
				   y: event.y
				 };
			activeWidget =  SearchFuture(screenPoint,lyr1991,lyr2025); 			
            setActiveButton(document.getElementById("searchButton"));	
			});		  
              break;           

            case null:
              if (activeWidget) {
                view.ui.remove(activeWidget);
                activeWidget.destroy();
                activeWidget = null;
              }
              break;          
		  function SearchFuture(Screen_points,lyr1991,lyr2025){
			view.hitTest(Screen_points).then(function (response) {
			  if (response.results.length) {
			   var graphic = response.results.filter(function (result) {
				// check if the graphic belongs to the layer of interest
				return result.graphic.layer === lyr2025;
			   })[0].graphic;
			   // do something with the result graphic
			   console.log("Gridecode: " + graphic.attributes.gridcode);
			   //lyr1991.visible = false;
			   lyr2025.definitionExpression =  "gridcode = " + graphic.attributes.gridcode ;
			   lyr1991.definitionExpression =  "gridcode = " + graphic.attributes.gridcode ;
			   lyr2025.opacity = 1;
			   lyr2025.visible = false;
			   lyr1991.visible = true;
			   document.getElementById("infoText").innerHTML = 'Gridcode: ' + graphic.attributes.gridcode;
				}
			 });			  
		  }
		  
		  }
        }
		function setActiveButton(selectedButton) {
          var elements = document.getElementsByClassName("active");
          for (var i = 0; i < elements.length; i++) {
            elements[i].classList.remove("active");
          }
          if (selectedButton) {
            selectedButton.classList.add("active");
          }
        }	
	}	
	
	function addLegend () {
		legend = new Legend ({
		view: view,
		});
		view.ui.add(legend,"bottom-right");
	}    
	
    /*Create and add the extent button widget*/
    function addExtentButton() {
        document
          .getElementById("homeButton")
          .addEventListener("click", function() {
            setActiveWidget(null);
            if (!this.classList.contains("active")) {
              setActiveWidget("home");
            } else {
              setActiveButton(null);
            }
          });
		function setActiveWidget (type) {
          switch (type) {
            case "home":
              activeWidget = fullExtent();
			  view.ui.add(activeWidget);
              setActiveButton(document.getElementById("homeButton"))			  
              break;           

            case null:
              if (activeWidget) {
                view.ui.remove(activeWidget);
                activeWidget.destroy();
                activeWidget = null;
              }
              break;
          }
        }
		function setActiveButton(selectedButton) {
          var elements = document.getElementsByClassName("active");
          for (var i = 0; i < elements.length; i++) {
            elements[i].classList.remove("active");
          }
          if (selectedButton) {
            selectedButton.classList.add("active");
          }
        }	
    }
	
	function addLayerList() { 
		layerList = new LayerList({
		view: view,
		listItemCreatedFunction: function(event){	
			var item = event.item;
			item.actionsSections = [[		   
			   {
				  title: "Increase opacity",
				  className: "esri-icon-up",
				  id: "increase-opacity"
				},
			   {
				  title: "Decrease opacity",
				  className: "esri-icon-down",
				  id: "decrease-opacity"
				},	
			 ]];					
			item.panel = {
			content: "legend",
			open: false		 		
			}
		 }				
		});      
		layerList.on("trigger-action", function(event){			   
		var item = event.item;			   
		var id = event.action.id;
			   
		if (item.title === 'Reference climate (1961-1990; for which seeds are adapted)'){					   
		  if (id === "increase-opacity") {
			if (lyr1991.opacity < 1) {
				lyr1991.opacity += 0.25;
			}
		  } else if (id === "decrease-opacity") {
			if (lyr1991.opacity > 0) {
				lyr1991.opacity -= 0.25;
			}
		  } 
		}

		if (item.title === 'Near Future climate (2025)'){					   
		  if (id === "increase-opacity") {
			if (lyr2025.opacity < 1) {
				lyr2025.opacity += 0.25;
			}
		  } else if (id === "decrease-opacity") {
			if (lyr2025.opacity > 0) {
				lyr2025.opacity -= 0.25;
			}
		  } 
		}		
	});
	view.ui.add(layerList,"top-right");
	};
	
	function addMouseCoord(){
      var coordsWidget = document.createElement("scaleDiv");
      coordsWidget.id = "coordsWidget";
      coordsWidget.className = "esri-widget esri-component";
      coordsWidget.style.padding = "2px 4px 2px";
	  coordsWidget.style.fontSize = "9pt";
	  coordsWidget.style.background = "#6e6e6e";
	  coordsWidget.style.color = "white";
	  coordsWidget.style.opacity = 0.6;	  
      view.ui.add(coordsWidget, "bottom-right");
	  function showCoordinates(pt) {
        var coords = "Lat/Lon " + pt.latitude.toFixed(3) + " " + pt.longitude.toFixed(3)
        coordsWidget.innerHTML = coords;
      }
	  
	  view.watch("stationary", function(isStationary) {
        showCoordinates(view.center);
      });

      view.on("pointer-move", function(evt) {
        showCoordinates(view.toMap({ x: evt.x, y: evt.y }));
      });
	}
	function addScalebar () {
		var scaleBar = new ScaleBar({
		  view: view,
		  unit: "metric",
		  style: "ruler"
		});

		view.ui.add(scaleBar, {
		position: "bottom-left"
		});		
	}
    function addBasemapGallery() {
        document
          .getElementById("basemapButton")
          .addEventListener("click", function() {
            setActiveWidget(null);
            if (!this.classList.contains("active")) {
              setActiveWidget("basemap");
            } else {
              setActiveButton(null);
            }
          });		
        function setActiveWidget(type) {
          switch (type) {
            case "basemap":
              activeWidget = new BasemapGallery({
				view: view,
				width: '300px'
				});

              view.ui.add(activeWidget, "top-right");
              setActiveButton(document.getElementById("basemapButton"));
              break;
          
            case null:
              if (activeWidget) {
                view.ui.remove(activeWidget);
                activeWidget.destroy();
                activeWidget = null;
              }
              break;
          }
        }
        function setActiveButton(selectedButton) {
          // focus the view to activate keyboard shortcuts for sketching
          view.focus();
          var elements = document.getElementsByClassName("active");
          for (var i = 0; i < elements.length; i++) {
            elements[i].classList.remove("active");
          }
          if (selectedButton) {
            selectedButton.classList.add("active");
          }
        }
    }	

    function addLogo() {
        document
          .getElementById("instructionButton")
          .addEventListener("click", function() {
            setActiveWidget(null);
            if (!this.classList.contains("active")) {
              setActiveWidget("instruction");
            } else {
              setActiveButton(null);
            }
          });
		  
		function setActiveWidget (type) {
          switch (type) {
            case "instruction":
			  window.open("https://maps.forsite.ca/cariboo_infoshare/docs/WebMapService_UserGuide_Cariboo.pdf", '_blank');
			  setActiveButton(document.getElementById("instructionButton"));
              break;           
            case null:
              if (activeWidget) {
                view.ui.remove(activeWidget);
                activeWidget.destroy();
                activeWidget = null; 
              }
              break;
          }
        }		  	
    }

    /*Create and add the print button*/
    function addPrintButton() {
		document
          .getElementById("printerButton")
          .addEventListener("click", function() {
            setActiveWidget(null);
            if (!this.classList.contains("active")) {
              setActiveWidget("printer");
            } else {
              setActiveButton(null);
            }
          });
		function setActiveWidget (type) {
          switch (type) {
            case "printer":
				activeWidget = new Print({
				view: view,
				id: "printer",
				printServiceUrl:
                    "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
        });
              view.ui.add(activeWidget,"manual");
			  setActiveButton(document.getElementById("printerButton"));
              break;           
            case null:
              if (activeWidget) {
                view.ui.remove(activeWidget);
                activeWidget.destroy();
                activeWidget = null;
              }
              break;
          }
        }
        function setActiveButton(selectedButton) {
          // focus the view to activate keyboard shortcuts for sketching
          view.focus();
          var elements = document.getElementsByClassName("active");
          for (var i = 0; i < elements.length; i++) {
            elements[i].classList.remove("active");
          }
          if (selectedButton) {
            selectedButton.classList.add("active");
          }
        }		
    }
	
    function fullExtent() {
        view.goTo({
            center: xy,
            zoom: 6
        });
    }
  });
 


