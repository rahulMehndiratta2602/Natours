export const displayMap = locations => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWVobmRpcmF0dGEyNiIsImEiOiJjbDB1eml4Z3owcTVnM2JuMWIwZXdpZjY4In0.JS3i3d0CJKoD-twz3m_xMA'
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mehndiratta26/cl0v3vt6i009614mdpuwt04u2',
        scrollZoom: false // style URL
        // center: [-118.113491, 34.111745], // starting position [lng, lat]
        // zoom: 10 // starting zoom
    })

    const bounds = new mapboxgl.LngLatBounds()

    locations.forEach(loc => {
        //Create Marker
        const el = document.createElement('div')
        el.className = 'marker'

        //Add Marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map)

        //add popup
        new mapboxgl
            .Popup({ offset: 30 })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}:${loc.description}</p>`)
            .addTo(map)
        //Extend map bounds to include current location
        bounds.extend(loc.coordinates)
    })
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 200,
            left: 200,
            right: 100
        }
    })
}
