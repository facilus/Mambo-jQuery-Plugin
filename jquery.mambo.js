/*
 * Mambo jQuery Plugin
 * @author: Valerio Barrila aka NinjaTux
 * @twitter: ninjatux2k
 */
;(function ($, window, document, undefined) {
    "use strict";
    // Plugin variables
    var name = "mambo",
        defaults = {
            value: 100,
            internalCircle: {
                line: "#FFF",
                fill: "#F2AC29"
            },
            percentage: {
                drawUnfilled: false,
                color: "#F2762E",
                unfilledColor: "#CCC"
            },
            text: {
                textColor: "#FFF",
                displayValue: true
            },
            drawShadow: false
        },
        radConst = Math.PI / 180,
        fullCircle = 2 * Math.PI;
    // Plugin constructor
    function Mambo (element, options) {
        this.element = element;
        this.options = $.extend(true, {}, defaults, options);
        this._defaults = defaults;
        this._name = name;
        this.init();
    }
    // Plugin methods
    Mambo.prototype = {
        init: function () {
            if(this.checkCanvas()) {
                this.context = this.element.getContext('2d');
                this.value = this.getValueDegrees();
                this.points = this.getPoints();
                $(this.element).css({"width": this.points.width + "px", "height": this.points.width + "px"});
                this.linesAndRadiuses = this.getLinesAndRadiuses();
                this.drawPercentage();
                if(this.options.percentage.drawUnfilled && this.value !== 360) {
                    this.drawExtraPercentage();
                }
                this.drawInternalCircle();
                if(this.options.drawShadow) {
                    this.drawShadow();
                }
                if(this.options.image) {
                    this.drawImage();
                } else {
                    this.drawText();
                }
            }
        },
        drawInternalCircle: function () {
            this.context.beginPath();
            this.context.moveTo(this.points.x, this.points.x);
            this.context.arc(this.points.x, this.points.x, this.linesAndRadiuses.internalRadius, 0, fullCircle, false);
            this.context.fillStyle = this.options.internalCircle.fill;
            this.context.lineWidth = this.linesAndRadiuses.internalLine;
            this.context.closePath();
            this.context.strokeStyle = this.options.internalCircle.line;
            this.context.stroke();
            this.context.fill();
        },
        drawPercentage: function () {
            this.context.beginPath();
            this.context.moveTo(this.points.x, this.points.x);
            this.context.arc(this.points.x, this.points.x, this.linesAndRadiuses.externalRadius, this.points.angle.start, this.points.angle.end, false);
            this.context.closePath();
            this.context.fillStyle = this.options.percentage.color;
            this.context.fill();
        },
        drawExtraPercentage: function () {
            this.context.beginPath();
            this.context.moveTo(this.points.x, this.points.x);
            this.context.arc(this.points.x, this.points.x, this.linesAndRadiuses.externalRadius, this.points.angle.start, this.points.angle.end, true);
            this.context.closePath();
            this.context.fillStyle = this.options.percentage.unfilledColor;
            this.context.fill();
        },
        drawShadow: function () {
            this.context.beginPath();
            this.context.arc(this.points.x, this.points.x, this.linesAndRadiuses.shadowRadius, 0, fullCircle, false);
            this.context.shadowColor = '#cbcbcb';
            this.context.lineWidth = this.linesAndRadiuses.shadowLine;
            this.context.strokeStyle = "rgba(255,255,255, 0.3)";
            this.context.stroke();
        },
        drawImage: function () {
            var max = (this.linesAndRadiuses.internalRadius-this.linesAndRadiuses.internalLine) * Math.sqrt(2),
                img = new Image(),
                iw,
                ih,
                _this = this;
            img.src = this.options.image.path;
            img.onload = function() {
                if (img.width > img.height) {
                    iw = max;
                    ih = Math.round(ih*(iw()/img.width)*100)/100;
                } else if (img.width < img.height) {
                    ih = max;
                    iw = Math.round(iw*(ih()/img.height)*100)/100;
                } else {
                    iw = ih = max;
                }
                _this.context.drawImage(img, (_this.points.width-iw)/2, (_this.points.width-ih)/2, iw, ih);
            };
        },
        drawText: function () {
            var fontPx;
            this.context.textAlign = "center";
            this.context.fillStyle = this.options.text.textColor;
            this.context.textBaseline = "bottom";
            if(this.options.text.displayValue) {
                fontPx = this.points.width / 3.5;
                this.context.font = "bold " + fontPx + "px helvetica";
                if(this.options.text.label && this.options.text.label.length > 0) {
                    this.context.fillText(this.options.text.label, this.points.x, this.points.x + this.linesAndRadiuses.internalRadius / 25);
                    this.context.fillText(this.options.value+"%", this.points.x, this.points.x + this.linesAndRadiuses.internalRadius / 1.5);
                } else {
                    this.context.fillText(this.options.value+"%", this.points.x, this.points.x + this.linesAndRadiuses.internalRadius / 2.3);
                }
            } else {
                fontPx = this.points.width / 2.5;
                this.context.font = "bold " + fontPx + "px helvetica";
                this.context.fillText(this.options.text.label, this.points.x, this.points.x + this.linesAndRadiuses.internalRadius / 1.8);
            }
        },
        getValueDegrees: function () {
            if(this.options.value) {
                return this.options.value * 3.6;
            } else {
                var value = parseInt(this.element.getAttribute('data-value'), 10);
                return (value === 100) ? 99.999 * 3.6 : value * 3.6;
            }
        },
        checkCanvas: function () {
            return !!(this.element.getContext && this.element.getContext('2d'));
        },
        getPoints: function () {
            return {
                width: this.element.width,
                x: this.element.width / 2,
                angle: {
                    start: (this.value === 360) ? 0 : 270 * radConst,
                    end: (this.value === 360) ? fullCircle : (this.value - 90) * radConst
                }
            };
        },
        getLinesAndRadiuses: function () {
            var shadowLine = this.points.width / 30,
                shadowRadius = this.points.x - shadowLine / 2,
                externalRadius = shadowRadius,
                internalLine = this.points.width / 35,
                internalRadius = externalRadius * 0.8;
            return {
                shadowLine: shadowLine,
                shadowRadius: shadowRadius,
                externalRadius: externalRadius,
                internalLine: internalLine,
                internalRadius: internalRadius
            };
        }
    };
    // Plugin wrapper
    $.fn[name] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + name)) {
                $.data(this, "plugin_" + name,
                    new Mambo(this, options));
            }
        });
    };
})(jQuery, window, document);