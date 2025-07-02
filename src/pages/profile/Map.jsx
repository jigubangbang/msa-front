import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import axios from "axios";
import { ComposableMap, Geographies, Geography, Sphere, Graticule, ZoomableGroup, Annotation } from "react-simple-maps";
import geography from "../../../src/assets/features.json";
import styles from "./Map.module.css";
import API_ENDPOINTS from "../../utils/constants";
import { useParams } from "react-router-dom";

// TODO: Add onClick function (show sidebar linking travel entries)

const Map = forwardRef((props, ref) => {
    const {userId} = useParams();

    const {
        sphereStrokeColor="#E4E5E6",
        sphereStrokeWidth=0.5,
        graticuleStrokeColor="#E4E5E6",
        graticuleStrokeWidth=0.5,
        geographyFill="#F3F3F3",
        geogrphyStrokeColor="#6b6b6b",
        geographyStrokeWidth=0.5,
        selectedCountry="",
        filledCountries=[],
        fillColor
    } = props;
    const [mapColor, setMapColor] = useState(fillColor);
    const [tooltipContent, setTooltipContent] = useState("");
    const [tooltipPos, setTooltipPos] = useState({x: 0, y: 0}); 
    const [showTooltip, setShowTooltip] = useState(false); 

    const [position, setPosition] = useState({coordinates: [0, 0], zoom: 1});
    useImperativeHandle(ref, () => ({
        zoomToCountry: (countryCoords) => {
            setPosition({coordinates: countryCoords, zoom: 4});
        }
    }));

    useEffect(() => {
        axios
            .get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}`)
            .then((response) => {
                switch (response.data.mapColor) {
                    case 'GREEN':
                        setMapColor("#93AD28");
                        break;
                    case 'PINK':
                        setMapColor("#FFB6C1");
                        break;
                    case 'YELLOW':
                        setMapColor("#F1DC81");
                        break;
                    default:
                        setMapColor("#83D9E0");
                }
            })
    }, []);
    return (
        <div 
            className={styles.mapContainer}
            onMouseMove={(e) => {
                setTooltipPos({x: e.clientX + 10, y: e.clientY + 10});
            }}
        >
            <ComposableMap className={styles.map}
                projectionConfig={{
                rotate: [-10, 0, 0],
                scale: 147
            }}
            >
                <ZoomableGroup center={position.coordinates} zoom={position.zoom}>
                    <Sphere stroke={sphereStrokeColor} strokeWidth={sphereStrokeWidth}/>
                    <Graticule stroke={graticuleStrokeColor} strokeWidth={graticuleStrokeWidth}/>
                    <Geographies geography={geography}>
                        {({geographies}) => 
                            geographies.map((geo) => (
                                <Geography 
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill={filledCountries.includes(geo.id) ? mapColor : geographyFill}
                                    stroke={geogrphyStrokeColor}
                                    strokeWidth={geographyStrokeWidth}
                                    onMouseEnter={() => {
                                        const name = geo.properties.name;
                                        setTooltipContent(name);
                                        setShowTooltip(true);
                                    }}
                                    onMouseLeave={() => {
                                        setShowTooltip(false);
                                    }}
                                />
                            ))
                        }
                    </Geographies>
                    {selectedCountry.name && (
                        <Annotation
                            subject={position.coordinates}
                            dx={-30}
                            dy={-15}
                            connectorProps={{
                                stroke: "#999",
                                strokeWidth: 0.5
                            }}
                        >
                            <text x="-8" textAnchor="end" alignmentBaseline="middle" fill="#999" fontSize="7" fontFamily="Pixelify Sans">
                                {selectedCountry.name}
                            </text>
                        </Annotation>
                    )}
                </ZoomableGroup>
            </ComposableMap>

            {showTooltip && (
                <div className={styles.tooltip} style={{left: tooltipPos.x, top: tooltipPos.y}}>
                    {tooltipContent}
                </div>
            )}
        </div>
    );
});

export default Map;