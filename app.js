const { default: gsap } = require('gsap/all')

let controller
let slideScene
let pageScene

function animatedSlides() {
  // Initialize controller
  controller = new ScrollMagic.Controller()

  // Select some things
  const sliders = document.querySelectorAll('.slide')
  const nav = document.querySelector('.nav-header')

  // Loop over each slide
  sliders.forEach((slide, index, slides) => {
    const revealImage = slide.querySelector('.reveal-image')
    const image = slide.querySelector('img')
    const revealText = slide.querySelector('.reveal-text')

    // GSAP
    const slideTimeLine = gsap.timeline({
      defaults: { duration: 1, ease: 'power2.inOut' },
    })
    slideTimeLine.fromTo(revealImage, { x: '0%' }, { x: '100%' })
    slideTimeLine.fromTo(image, { scale: 2 }, { scale: 1 }, '-=1')
    slideTimeLine.fromTo(revealText, { x: '0%' }, { x: '100%' }, '-=0.75')
    slideTimeLine.fromTo(nav, { y: '-100%' }, { y: '0%' }, '-=0.5')

    // Create scene
    slideScene = new ScrollMagic.Scene({
      triggerElement: slide,
      triggerHook: 0.25,
      reverse: false,
    })
      .setTween(slideTimeLine)
      .addIndicators({
        colorStart: 'white',
        colorTrigger: 'white',
        name: 'slide',
      })
      .addTo(controller)

    // New animation
    const pageTimeLine = gsap.timeline()
    let nextSlide = slides.length - 1 === index ? 'end' : slides[index + 1]
    if (nextSlide === 'end') {
      return false
    }

    pageTimeLine.fromTo(nextSlide, { y: '0%' }, { y: '50%' })
    pageTimeLine.fromTo(
      slide,
      { opacity: 1, scale: 1 },
      { opacity: 0, scale: 0.5 }
    )
    pageTimeLine.fromTo(nextSlide, { y: '50%' }, { y: '0%' }, '-=0.5')

    // Create new scene
    pageScene = new ScrollMagic.Scene({
      triggerElement: slide,
      duration: '100%',
      triggerHook: 0,
    })
      .addIndicators({
        colorStart: 'white',
        colorTrigger: 'white',
        name: 'page',
        indent: 200,
      })
      .setPin(slide, { pushFollowers: false })
      .setTween(pageTimeLine)
      .addTo(controller)
  })
}

const mouse = document.querySelector('.cursor')
const mouseText = mouse.querySelector('span')
const burger = document.querySelector('.burger')

function cursor(e) {
  mouse.style.top = e.pageY + 'px'
  mouse.style.left = e.pageX + 'px'
}

function activeCursor(e) {
  const item = e.target

  if (item.id === 'logo' || item.classList.contains('burger')) {
    mouse.classList.add('nav-active')
  } else {
    mouse.classList.remove('nav-active')
  }

  if (item.classList.contains('explore')) {
    mouse.classList.add('explore-active')
    gsap.to('.title-swipe', 1, { y: '0%' })
    mouseText.innerText = 'Tap'
  } else {
    mouse.classList.remove('explore-active')
    gsap.to('.title-swipe', 1, { y: '100%' })
    mouseText.innerText = ''
  }
}

function navToggle(e) {
  if (!e.target.classList.contains('active')) {
    e.target.classList.add('active')
    gsap.to('.line-1', 0.5, { rotate: '45', y: 5, background: 'black' })
    gsap.to('.line-2', 0.5, { rotate: '-45', y: -5, background: 'black' })
    gsap.to('#logo', 1, { color: 'black' })
    gsap.to('.nav-bar', 1, { clipPath: 'circle(2500px at 100% -10%)' })
    document.body.classList.add('hide')
  } else {
    e.target.classList.remove('active')
    gsap.to('.line-1', 0.5, { rotate: '0', y: 0, background: 'white' })
    gsap.to('.line-2', 0.5, { rotate: '0', y: 0, background: 'white' })
    gsap.to('#logo', 1, { color: 'white' })
    gsap.to('.nav-bar', 1, { clipPath: 'circle(50px at 100% -10%)' })
    document.body.classList.remove('hide')
  }
}

// Barba page transitions
const logo = document.querySelector('#logo')

barba.init({
  views: [
    {
      namespace: 'home',
      beforeEnter() {
        animatedSlides()
        logo.href = './index.html'
      },
      beforeLeave() {
        slideScene.destroy()
        pageScene.destroy()
        controller.destroy()
      },
    },
    {
      namespace: 'fashion',
      beforeEnter() {
        logo.href = '../index.html'
        gsap.fromTo(
          '.nav-header',
          1,
          { y: '100%' },
          { y: '0%', ease: 'power2.inOut' }
        )
      },
    },
  ],
  transitions: [
    {
      leave({ current, next }) {
        let done = this.async()
        // Animation
        const timeLine = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
        timeLine.fromTo(current.container, 1, { opacity: 1 }, { opacity: 0 })
        timeLine.fromTo(
          '.swipe',
          0.75,
          { x: '-100%' },
          { x: '0%', onComplete: done },
          '-=0.5'
        )
      },
      enter({ current, next }) {
        let done = this.async()
        // Scroll to the top
        window.scrollTo(0, 0)
        // Animation
        const timeLine = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
        timeLine.fromTo(
          '.swipe',
          1,
          { x: '0%' },
          { x: '100%', stagger: 0.5, onComplete: done }
        )
        timeLine.fromTo(next.container, 1, { opacity: 0 }, { opacity: 1 })
      },
    },
  ],
})

// EventListeners
burger.addEventListener('click', navToggle)
window.addEventListener('mousemove', cursor)
window.addEventListener('mouseover', activeCursor)
