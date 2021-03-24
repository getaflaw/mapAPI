ymaps.ready(init);
let coords;

function init() {

    var myMap = new ymaps.Map('map', {
            center: [59.94086764, 30.32816879],
            zoom: 12,
            behaviors: ['default', 'scrollZoom'],
            controls: ['zoomControl']
        }), data = new ymaps.data.Manager({
            users: [

            ]
        }), arrayReviewsBallon = {users: []},
        template = new ymaps.Template('{% for user in users %}' +
            `<div class="balloon-reviews">` +
            `<div class="balloon-reviews__user">{{user.name}}</div>` +
            `<div class="balloon-reviews__place">{{user.place}}</div>` +
            `<div class="balloon-reviews__description">{{user.description}}</div>` +
            `</div>` +
            '{% endfor %}'),
        MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
            `<div class="balloonEditor">` +
            `<div class="balloonEditor__header"><span class="balloonEditor__positionIcon"></span><p class="balloonEditor__address">{{properties.address}}</p><a class="balloonEditor__close" href="#">&times;</a></div>` +
            `<div class="balloonEditor__reviews">` +
            '$[[options.contentLayout observeSize minWidth=367 maxWidth=367 maxHeight=160]]' +
            `</div><form class="balloonEditor__form balloon-form" action="">` +
            `<h5 class="balloon-form__title">Ваш отзыв</h5>` +
            ` <input type="text" class="balloon-form__name" placeholder="Введите Имя">` +
            `<input type="text" class="balloon-form__place" placeholder="Названия заведения">` +
            `<textarea name="" id="" cols="30" rows="10" class="balloon-form__description" placeholder="Поделитесь впечатлениями..."></textarea>` +
            `<button class="balloon-form__submit">Добавить</button>` +
            ` </form>` +
            `</div>`, {
                build: function () {
                    this.constructor.superclass.build.call(this);

                    this._$element = $('.balloonEditor', this.getParentElement());

                    this.applyElementOffset();

                    this._$element.find('.balloonEditor__close')
                        .on('click', $.proxy(this.onCloseClick, this));

                    this._$element.find('.balloon-form__submit')
                        .on('click', $.proxy(this.onSubmitClick, this));
                },
                clear: function () {
                    this._$element.find('.balloonEditor__close')
                        .off('click');

                    this._$element.find('.balloon-form__submit')
                        .off('click');

                    this.constructor.superclass.clear.call(this);
                },
                onSublayoutSizeChange: function () {
                    MyBalloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);

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
                    let nameReviews = $('.balloon-form__name').val();
                    let placeReviews = $('.balloon-form__place').val();
                    let descriptionReviews = $('.balloon-form__description').val();
                    arrayReviewsBallon.users.push({name: nameReviews, place: placeReviews, description: descriptionReviews})
                    data.set(arrayReviewsBallon);
                    console.log(this._data.geoObject);
                    this._data.geoObject.properties.set('balloonContent',template.build(data).text);
                },
                onCloseClick: function (e) {
                    e.preventDefault();
                    this._data.geoObject.properties.set('dataReviews', arrayReviewsBallon);
                    data.unsetAll();
                    this.events.fire('userclose');
                    arrayReviewsBallon = {users: []}
                },
                getShape: function () {
                    if (!this._isElement(this._$element)) {
                        return MyBalloonLayout.superclass.getShape.call(this);
                    }

                    var position = this._$element.position();

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
            }),
        MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
            '$[properties.balloonContent]'
        );

    myMap.events.add('click', function (e) {
        if (!myMap.balloon.isOpen()) {
            var coords = e.get('coords');
            myPlacemark = new ymaps.Placemark(coords, {
                address: coords,
                balloonContent: template.build(data).text
            }, {
                balloonShadow: false,
                balloonLayout: MyBalloonLayout,
                balloonContentLayout: MyBalloonContentLayout,
                balloonPanelMaxMapArea: 0,
                hideIconOnBalloonOpen: true
            });
            myMap.geoObjects.add(myPlacemark);
            myPlacemark.balloon.open();
        } else {
            myPlacemark.properties.set('dataReviews', arrayReviewsBallon);
            data.unsetAll();
            arrayReviewsBallon = {users: []}
            myMap.balloon.close();
        }
    });
    myMap.geoObjects.events.add('click', function (e) {
        console.log(e.get('target'));
        arrayReviewsBallon = e.get('target').properties._data.dataReviews;
        data.set(arrayReviewsBallon);
        e.get('target').properties.set('balloonContent',template.build(data).text);
        //.properties.set('balloonContent',template.build(data).text);
    });

}



