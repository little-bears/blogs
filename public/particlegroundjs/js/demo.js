/**
 * Particleground demo
 * @author Jonathan Nicol - @mrjnicol
 */

document.addEventListener('DOMContentLoaded', function () {
  particleground(document.getElementById('particles'), {
    dotColor: 'rgb(222, 222, 222)',
    lineColor: 'rgb(225, 225, 225)'
  });
  var intro = document.getElementById('intro');
  intro && (intro.style.marginTop = - intro.offsetHeight / 2 + 'px');
}, false);