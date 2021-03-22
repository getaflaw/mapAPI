ymaps.ready(init);

function init() {
    var myMap = new ymaps.Map('map', {
            center: [59.94086764, 30.32816879],
            zoom: 12,
            controls: ['zoomControl']
        }),
        placeMarker = new ymaps.Placemark([59.94016764, 30.32811879], {
            hintContent: 'Это мой хинт',
            balloonContent: 'это мой балун'
        }),
        placeMarkCreator;

    function createEditorPlaceMarker(coords) {
        return new ymaps.Placemark(coords, {
            iconCaption: 'поиск...'
        }, {
            preset: 'islands#violetDotIconWithCaption',
            draggable: true
        });
    }

    function getAddress(coords) {
        placeMarkCreator.properties.set('iconCaption', 'поиск...');
        ymaps.geocode(coords).then(function (res) {
            var firstGeoObject = res.geoObjects.get(0);

            placeMarkCreator.properties.set({
                iconCaption: [
                    firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(),
                    firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
                ].filter(Boolean).join(', '),
                balloonContent: firstGeoObject.getAddressLine()
            });
        })
    }


    myMap.events.add('click', function (e) {
        var coords = e.get('coords');
        if (placeMarkCreator) {
            placeMarkCreator.geometry.setCoordinates(coords);
        } else {
            placeMarkCreator = createEditorPlaceMarker(coords);
            myMap.geoObjects.add(placeMarkCreator);
            placeMarkCreator.events.add('dragend', function () {
                getAddress(placeMarkCreator.geometry.getCoordinates());
            });
        }
        getAddress(coords);
    });


    //myMap.geoObjects.add(placeMarker);
}

