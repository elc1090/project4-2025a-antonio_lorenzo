import React from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const MapWithMarkers = ({ places }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.GOOGLE_API_KEY // ou process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  if (loadError) return <div>Erro ao carregar mapa</div>;
  if (!isLoaded) return <div>Carregando mapa...</div>;

  // Centralizar no primeiro lugar (ou fallback)
  const center = places.length > 0
    ? { lat: places[0].lat, lng: places[0].lng }
    : { lat: -23.55052, lng: -46.633308 }; // São Paulo como padrão

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
    >
      {places.map((place, index) => (
        <Marker
          key={index}
          position={{ lat: place.lat, lng: place.lng }}
          title={place.nome}
        />
      ))}
    </GoogleMap>
  );
};

export default MapWithMarkers;
