'use strict';

import '../css/index.css';
import $ from 'jquery';

$(document)
  .ready(() => {
    let zIndex = 1;
    let updateTime = null;
    let running = false;
    let emptySquare = 16;
    let totalSteps = 0;
    let totalTime = 0;
    const originalDivs = [];

    function readData() {
      return JSON.parse(localStorage.getItem('puzzlegame'));
    }

    function updateShow() {
      const data = readData();
      if (data && data.scores) {
        $('#scores-list')
          .html('');
        let str = '';
        data.scores.forEach((e) => {
          str += `
          <li>用时:${e.time}秒, 步数:${e.step} - ${(new Date(e.lastTime)).toLocaleString()}</li>
          `;
        });
        $('#scores-list')
          .append(`${str}</ul>`);
        $('#scoresCount')
          .text(`次数: ${data.scores.length}`);
      }
    }


    function saveData(data) {
      const beforeData = readData();
      let newData;

      if (beforeData && beforeData.scores) {
        beforeData.scores.unshift(data.scores);
        newData = beforeData;
      } else {
        newData = {
          scores: [data.scores],
        };
      }
      localStorage.setItem('puzzlegame', JSON.stringify(newData));
    }


    $.fn.extend({
      puzzlegame(squareSize) {
        const gameHandle = `#${$(this).attr('id')}`;
        // const sqSize = squareSize + 'px';
        const boardSize = `${(squareSize * 4)}px`;
        const backgroundPostions = [];

        $(gameHandle)
          .html('<div id="board"></div>');

        const board = $('#board');

        board.css({
          position: 'absolute',
          width: boardSize,
          gameHandle: boardSize,
          border: '1px solid gray',
        });

        for (let i = 0; i < 16; i++) {
          //  const bx = `${(-(i % 4) * squareSize)}px`;
          //  const by = `${(-Math.floor(i / 4) * squareSize)}px`;
          const bx = (-(i % 4) * squareSize);
          const by = -Math.floor(i / 4) * squareSize;
          const backgroundPostion = `${bx}px ${by}px`;

          originalDivs.push({
            bx,
            by,
          });
          backgroundPostions.push(backgroundPostion);

          const div =
            `<div style="left:${-bx}px;top:${-by}px;width:${squareSize}px;
          height:${squareSize}px;background-position:${backgroundPostion};"></div>`;

          board.append(div);
        }

        const usedPostions = [];
        board.children('div')
          .each((index, elem) => {
            const randomPosition = function randomPosition() {
              return Math.round(Math.random() * 15);
            };
            let rp = randomPosition();
            do {
              rp = randomPosition();
            } while (usedPostions.indexOf(backgroundPostions[rp]) !== -1);

            $(elem)
              .css('background-position', backgroundPostions[rp]);
            usedPostions.push(backgroundPostions[rp]);
          });

        emptySquare = Math.round(Math.random() * 16);

        board.children(`div:nth-child(${emptySquare})`)
          .css({
            backgroundImage: '',
            background: '#fff',
          });
      },
    });


    function checkComplete() {
      let isOk = true;

      $(document)
        .find('#board')
        .children('div')
        .each((index, elem) => {
          const backgroundPosition = $(elem).css('backgroundPosition')
                                            .replace(/px/g, '')
                                            .split(' ');
          const bx = backgroundPosition[0];
          const by = backgroundPosition[1];

          const offset = $(elem).offset();
          if (-bx !== offset.left || -by !== offset.top) {
            isOk = false;
            return false;
          }
        });

      if (isOk) {
        running = false;
        clearInterval(updateTime);
        saveData({
          scores: {
            time: totalTime,
            step: totalSteps,
            lastTime: new Date(),
          },
        });
        alert(`恭喜 拼图成功啦! \n\t用时:  ${totalTime}秒.\n\t步数: ${totalSteps}`);
        window.location.reload();
      }
    }

    function move(clickedSquare, squareSize) {
      let movable = false;
      const board = $('#board');
      const clickedSquareElement = $(clickedSquare);
      const oldX = board.children(`div:nth-child(${emptySquare})`)
        .css('left');
      const oldY = board.children(`div:nth-child(${emptySquare})`)
        .css('top');
      const newX = clickedSquareElement.css('left');
      const newY = clickedSquareElement.css('top');

      if (oldX === newX && newY === `${(parseInt(oldY, 10) - squareSize)}px`) {
        movable = true;
      }

      if (oldX === newX && newY === `${(parseInt(oldY, 10) + squareSize)}px`) {
        movable = true;
      }

      if (newX === `${(parseInt(oldX, 10) - squareSize)}px` && newY === oldY) {
        movable = true;
      }

      if (newX === `${(parseInt(oldX, 10) + squareSize)}px` && newY === oldY) {
        movable = true;
      }

      if (movable) {
        clickedSquareElement.css('z-index', zIndex += 2);
        totalSteps++;

        $('#total-steps')
          .fadeIn(500, () => {
            $('#total-steps')
              .text(`步数:${totalSteps}`)
              .fadeIn(500);
          });

        clickedSquareElement.animate({
          left: oldX,
          top: oldY,
        }, 200, () => {
          board.children(`div:nth-child(${emptySquare})`)
            .css({
              left: newX,
              top: newY,
              'z-index': zIndex,
            });

          checkComplete();
        });
      }
    }

    updateShow();

    const squareSize = 160;

    $('#gameHandle')
      .puzzlegame(squareSize);

    $('#start-btn')
      .click(function btnClink() {
        if (running) {
          alert('游戏已经在进行中了...');
          return;
        }

        $(this)
          .text('游戏进行中...');

        const startTime = new Date;

        updateTime = setInterval(() => {
          totalTime = parseInt((new Date - startTime) / 1000, 10);
          $('#timer')
            .text(`时间:${totalTime}秒`);
        }, 1000);

        running = true;
      });

    $('#board')
      .children('div')
      .click(function divClick() {
        if (!running) {
          return;
        }
        move(this, squareSize);
      });
  });
