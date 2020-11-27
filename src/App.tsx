/**
 * Libs
 */
import * as LeafletUtils from "./leaflet";
import React from "react";
import _ from "lodash";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Reducer from "./reducer";

/**
 * UI
 */
import "./styles.scss";
import Loader from "./components/Loader";
import LayerSelectorPopup from "./components/LayerSelectorPopup";


/**
 * Assets
 */
import KadasterImg from "./assets/Logo-kadaster.png";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import * as sBP from "./helpers/searchByPoint";


let _debug: any = (window as any)._debug || {};
(window as any)._debug = _debug;
const App: React.FC = () => {
    const [state, dispatch] = React.useReducer(Reducer.reducer, Reducer.initialState);
    //Set state in window for debugging
    _debug.state = state;
    _debug.dispatch = dispatch;

    /**
     * Effect that runs on-mount only
     */
    React.useEffect(() => {
        LeafletUtils.init({
            onZoomChange: zoom => {
                dispatch({type: "zoomChange", value: zoom});
            },
            onContextSearch: ctx => {
                dispatch({type: "coordinate_search_start", value: ctx});
            },
            onClick: el => {
                dispatch({type: "selectObject", value: el});
            },
            onLayersClick: info => {
                dispatch({type: "clickLayer", value: info});
            }
        });

        return () => {
        };
    }, []);

    /**
     * Trigger context query
     //  */
    React.useEffect(() => {
        if (state.coordinateQuery) {
            sBP.getFromCoordinates(state.coordinateQuery.lat, state.coordinateQuery.lng, state.zoomLevel)
                .then(res => {
                    dispatch({type: "coordinate_search_success", results: res as any});
                })
                .catch(() => {
                    dispatch({type: "coordinate_search_error"});
                });
        }
    }, [state.coordinateQuery]);

    /**
     * Update leaflet when search results or selection changes
     */
    React.useEffect(() => {
        console.log("stateResults:", state.searchResults);
        if (state.selectedObject) {
            try {
                console.log("we zitten nu in de try van de if")
                LeafletUtils.updateMap({
                    selectedObject: state.selectedObject,
                    updateZoom: false
                });
            } catch {
                console.log("we zitten nu in de catch van de if")
            }
        }
        else {
            console.log("we zitten boven de try van de else", state.searchResults)
            try {
                console.log("we zitten nu in de try van de else", state.searchResults)
                LeafletUtils.updateMap({
                    updateZoom: false,
                    searchResults: state.searchResults
                });
            } catch(e) {
                console.log("we zitten nu in de catch van de else ", e)
            }
        }
        ;
    }, [state.searchResults, state.selectedObject]);

    /**
     * Update leaflet when clustering setting changes
     */
    React.useEffect(() => {
        LeafletUtils.toggleClustering(state.mapClustered);
        LeafletUtils.updateMap({
            searchResults: state.searchResults,
            selectedObject: state.selectedObject,
            updateZoom: false
        });
    }, [state.mapClustered]);

    return (
        <section className="App">
            <div className="headerEtc">
                <div onClick={() => dispatch({type: "reset"})}>
                    <div className="header">
                        <h1>BGT LDMaps</h1>
                        <img src={KadasterImg} alt="kadaster logo"/>
                    </div>
                </div>
                <div className="startText">
                    <p>Ontdek de objecten uit de Basisregistratie Grootschalige Topografie op de kaart van Nederland
                        door op de kaart te klikken met de rechtermuisknop.</p>
                </div>
            </div>
            <div className={state.isFetching ? "mapHolderLoading" : "mapHolder"}
                 onContextMenu={e => e.preventDefault()}>
                <Loader loading={state.isFetching}/>
                <div id="map"/>
            </div>
            <LayerSelectorPopup
                handleClose={() => dispatch({type: "closeClickedLayer"})}
                handleClick={el => {
                    dispatch({type: "selectObject", value: el});
                }}
                options={state.clickedLayer}
            />
            <ToastContainer/>
        </section>
    );
};


export default App;
