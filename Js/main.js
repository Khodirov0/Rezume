

// ------

var elem = document.querySelector(".header__top-title");

var text = elem.innerHTML;

elem.innerHTML = " ";

var counter = 0;
function writer() {
  elem.innerHTML += text.charAt(counter)

  counter++;

  if (text.length == counter) {
    clearInterval(timer)
  }
}

var timer = setInterval(writer, 100);


function drawPercentageCircle(percentage) {
  const canvas = document.getElementById("circle-canvas");
  const context = canvas.getContext("2d");

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = canvas.width / 2 - 10;


  const degrees = (percentage / 100) * 360;

  const gradient = context.createRadialGradient(centerX, centerY, radius - 10, centerX, centerY, radius);
  gradient.addColorStop(0, "lightgray");
  gradient.addColorStop(1, "green");

  context.beginPath();
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  context.fillStyle = gradient;
  context.fill();

  context.fillStyle = "white";
  context.font = "bold 20px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(percentage + "%", centerX, centerY);
}


// SLIDER

class Slider {
  constructor(node) {
    this.node = node;
    this.list = null;
    this._counter = 0;
    this.sides = 0;
    this.step = 0;
    this.shift = 0;

    this.findParts();
    this.prepare();
    this.listen();
  }

  findParts() {
    this.list = this.node.querySelector('[data-slider-list]');
    this.items = [...this.list.children];
    this.step_buttons = [...this.node.querySelectorAll('[data-slider-step-button]')].map((button) => {
      return {
        node: button,
        value: !!button.dataset.sliderStepButton ? +button.dataset.sliderStepButton : 1,
      };
    });
  }

  prepare() {
    this.sides = this.items.length;
    this.step = 2 * Math.PI / this.sides;
    this.shift = Math.PI / 2;
    this.counter = 0;
  }

  listen() {
    this.step_buttons.forEach((button) => {
      button.node.addEventListener('click', () => {
        this.counter = this.counter + button.value;
        this.updateActiveClass();
      });
    });

    document.addEventListener('keydown', (e) => {
      this.listenKeys(e);
    });
  }

  listenKeys(e) {
    if (e.key === 'ArrowLeft') {
      this.counter = this.counter - 1;
      this.updateActiveClass();
    } else if (e.key === 'ArrowRight') {
      this.counter = this.counter + 1;
      this.updateActiveClass();
    }
  }

  updateActiveClass() {
    this.items.forEach((item, i) => {
      if (i === this.counter) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  notify() {
    this.items.forEach((item, i) => {
      const pos = (i + this.counter) * this.step + this.shift;
      const cos = Math.cos(pos);
      const sin = Math.sin(pos);
      const scale = Math.max(0.3, (sin + 1) / 2);

      item.style.setProperty('--cos', cos);
      item.style.setProperty('--sin', sin);
      item.style.setProperty('--scale', scale);
    });
  }

  get counter() {
    return this._counter;
  }

  set counter(new_value) {
    this._counter = new_value < 0 ? this.sides + new_value : new_value % this.sides;
    this.updateActiveClass();
    this.notify();
  }
}

const slider = new Slider(document.querySelector('.slider'));


// portfolio

class Protfolio {

  constructor(config) {
    this.slider = document.querySelector(config.el);
    this.sliderBox = this.slider.querySelector('.por__slider-box');
    this.sliderItem = this.sliderBox.children
    this.next = this.slider.querySelector('.por__slider-next')
    this.prev = this.slider.querySelector('.por__slider-prev')

    this.timeMove = config.time == undefined ? 1000 : config.time

    this.dir = config.direction == 'X' ? 'X' : 'Y'


    this.height = this.slider.clientHeight
    this.width = this.slider.clientWidth

    this.moveSize = 'X' == this.dir ? this.width : this.height

    this.autoplay = config.autoplay

    this.interval = isNaN(config.interval) == true ? this.timeMove + 1000 : config.interval < this.timeMove + 1000 ? console.error('Interval time dan kichik bolishi keremas !!!') : config.interval

    this.activeSlide = 0

    this.sliderBox.style = ` 
                                  position: relative;
                                  height: ${this.height}px;
                                  overflow: hidden;
        `

    for (let i = 0; i < this.sliderItem.length; i++) {
      const slides = this.sliderItem[i]

      slides.style = ` 
                             position: absolute;
                             width: ${this.width}px;
                             height: ${this.height}px;  
                          `

      if (i != this.activeSlide) {
        slides.style.transform = ` translate${this.dir}(${this.moveSize}px)`
      }

      if (i == this.sliderItem.length - 1) {
        slides.style.transform = ` translate${this.dir}(-${this.moveSize}px)`
      }

    }

    if (this.autoplay == true) {
      let interval = setInterval(() => {
        this.clickBtn(this.next)
      }, this.interval)

      this.sliderBox.addEventListener('mouseenter', () => {
        clearInterval(interval)
      })
      this.sliderBox.addEventListener('mouseleave', () => {
        interval = setInterval(() => {
          this.clickBtn(this.next)
        }, this.interval)
      })
    }

    this.next.addEventListener('click', () => this.clickBtn(this.next))
    this.prev.addEventListener('click', () => this.clickBtn(this.prev))
  }


  clickBtn(btn) {

    this.next.disabled = true
    this.prev.disabled = true

    setTimeout(() => {
      this.next.disabled = false
      this.prev.disabled = false
    }, this.timeMove)


    const nextOrPrev = btn == this.next ? this.moveSize * -1 : this.moveSize

    for (let i = 0; i < this.sliderItem.length; i++) {
      const slides = this.sliderItem[i]
      slides.style.transition = '0ms'

      if (i != this.activeSlide) {
        slides.style.transform = ` translate${this.dir}(${nextOrPrev * -1}px)`
      }
    }

    this.sliderItem[this.activeSlide].style.transform = ` translate${this.dir}( ${nextOrPrev}px)`
    this.sliderItem[this.activeSlide].style.transition = this.timeMove + 'ms'

    if (btn == this.next) {
      this.activeSlide++

      if (this.activeSlide >= this.sliderItem.length) {
        this.activeSlide = 0
      }
    } else if (btn == this.prev) {
      this.activeSlide--

      if (this.activeSlide < 0) {
        this.activeSlide = this.sliderItem.length - 1
      }
    }


    this.sliderItem[this.activeSlide].style.transform = ` translate${this.dir}(0px)`
    this.sliderItem[this.activeSlide].style.transition = this.timeMove + 'ms'



  }

}

const slider3 = new Protfolio({
  el: "#carousel3",
  time: 1000,
  direction: 'X',
  autoplay: true,
  interval: 3000

})


// WOW


