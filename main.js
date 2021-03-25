let dataReviews = {reviews: []};
let BalloonTemplate =
    `<div class="balloonEditor">` +
    `<div class="balloonEditor__header"><span class="balloonEditor__positionIcon"></span><p class="balloonEditor__address">{{properties.address}}</p><a class="balloonEditor__close" href="#">&#10006;</a></div>` +
    `<div class="balloonEditor__reviews">` +
    '$[[options.contentLayout observeSize minWidth=367 maxWidth=367 maxHeight=160]]' +
    `</div><form class="balloonEditor__form balloon-form" action="">` +
    `<h5 class="balloon-form__title">Ваш отзыв</h5>` +
    ` <input type="text" id="balloon-form__name" placeholder="Введите Имя">` +
    `<input type="text" id="balloon-form__place" placeholder="Названия заведения">` +
    `<textarea name="" id="balloon-form__description" cols="30" rows="10" placeholder="Поделитесь впечатлениями..."></textarea>` +
    `<button id="balloon-form__submit">Добавить</button>` +
    ` </form>` +
    `</div>`;


ymaps.ready(init);


function init() {
    const myMap = new ymaps.Map('map', {
        center: [59.94086764, 30.32816879],
        zoom: 12,
        behaviors: ['default', 'scrollZoom'],
        controls: ['zoomControl']
    })
    let ymapsDataReviews = new ymaps.data.Manager({
        reviews: []
    })
    const balloonTemplateList = new ymaps.Template('{% for review in reviews %}' +
        `<div class="balloon-reviews">` +
        `<div class="balloon-reviews__user">{{review.name}}</div>` +
        `<div class="balloon-reviews__place">{{review.place}}</div>` +
        `<div class="balloon-reviews__onCreate">{{review.onCreate}}</div>` +
        `<div class="balloon-reviews__description">{{review.description}}</div>` +
        `</div>` +
        '{% endfor %}')
    const PlaceMarkReviews = ymaps.templateLayoutFactory.createClass('$[properties.balloonContent]');
    const BalloonOptions = ymaps.templateLayoutFactory.createClass(BalloonTemplate, {
            build: function () {
                this.constructor.superclass.build.call(this);

                this._$element = $('.balloonEditor', this.getParentElement());

                this.applyElementOffset();

                this._$element.find('.balloonEditor__close')
                    .on('click', $.proxy(this.onCloseClick, this));

                this._$element.find('#balloon-form__submit')
                    .on('click', $.proxy(this.onSubmitClick, this));
            },
            clear: function () {
                this._$element.find('.balloonEditor__close')
                    .off('click');

                this._$element.find('#balloon-form__submit')
                    .off('click');

                this.constructor.superclass.clear.call(this);
            },
            onSublayoutSizeChange: function () {
                this.constructor.superclass.onSublayoutSizeChange.apply(this, arguments);

                if (!this._isElement(this._$element)) {
                    return;
                }

                this.applyElementOffset();

                this.events.fire('shapechange');
            },
            applyElementOffset: function () {
                this._$element.css({
                    left: -(this._$element[0].offsetWidth / 2),
                    top: -(this._$element[0].offsetHeight + this._$element.find('.balloonEditor__close')[0].offsetHeight)
                });
            },
            onSubmitClick: function (event) {
                event.preventDefault();
                let nameReviews = $('#balloon-form__name').val();
                let placeReviews = $('#balloon-form__place').val();
                let descriptionReviews = $('#balloon-form__description').val();
                let date = new Date();
                dataReviews.reviews.push({
                    name: nameReviews,
                    place: placeReviews,
                    onCreate: `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`,
                    description: descriptionReviews
                })
                ymapsDataReviews.set(dataReviews);
                this._data.geoObject.properties.set('balloonContent', balloonTemplateList.build(ymapsDataReviews).text);
            },
            onCloseClick: function (e) {
                e.preventDefault();
                this._data.geoObject.properties.set('dataReviews', dataReviews);
                ymapsDataReviews.unsetAll();
                this.events.fire('userclose');
                dataReviews = {reviews: []}
            },
            getShape: function () {
                if (!this._isElement(this._$element)) {
                    return this.constructor.superclass.getShape.call(this);
                }

                let position = this._$element.position();

                return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                    [position.left, position.top], [
                        position.left + this._$element[0].offsetWidth,
                        position.top + this._$element[0].offsetHeight + this._$element.find('.balloonEditor__close')[0].offsetHeight
                    ]
                ]));
            },
            _isElement: function (element) {
                return element && element[0] && element.find('.balloonEditor__close')[0];
            }
        })


    function getAddress(coords) {
        ymaps.geocode(coords).then(function (res) {
            let firstGeoObject = res.geoObjects.get(0);
            myPlacemark.properties.set({address: firstGeoObject.getAddressLine()});
        });
    }


    myMap.events.add('click', function (e) {
        if (!myMap.balloon.isOpen()) {
            let coords = e.get('coords');
            myPlacemark = new ymaps.Placemark(coords, {
                address: coords,
                balloonContent: balloonTemplateList.build(ymapsDataReviews).text
            }, {
                balloonShadow: false,
                balloonLayout: BalloonOptions,
                balloonContentLayout: PlaceMarkReviews,
                balloonPanelMaxMapArea: 0,
                hideIconOnBalloonOpen: true
            });
            //getAddress(coords);
            myMap.geoObjects.add(myPlacemark);
            myPlacemark.balloon.open();
        } else {
            myPlacemark.properties.set('dataReviews', dataReviews);
            ymapsDataReviews.unsetAll();
            dataReviews = {reviews: []}
            myMap.balloon.close();
        }
    });
    myMap.geoObjects.events.add('click', function (e) {
        dataReviews = e.get('target').properties._data.dataReviews;
        ymapsDataReviews.set(dataReviews);
        e.get('target').properties.set('balloonContent', balloonTemplateList.build(ymapsDataReviews).text);
    });

}



