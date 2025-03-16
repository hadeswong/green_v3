class CardSlider {
    constructor() {
        this.cards = document.querySelectorAll('.card-container');
        this.initializeCardFeatures();
        this.setupAutoReset();
        this.showAllCards();
    }

    showAllCards() {
        this.cards.forEach(card => {
            card.classList.add('visible');
        });
    }

    initializeCardFeatures() {
        this.cards.forEach((cardContainer, index) => {
            const header = cardContainer.querySelector('.member-header');
            const contentWrapper = cardContainer.querySelector('.card-content-wrapper');
            const recycleCheck = cardContainer.querySelector(`#recycleCheck-${index}`);
            const alert = cardContainer.querySelector(`#alert-${index}`);
            const cardBack = cardContainer.querySelector('.green-card-back');
            const cardInner = cardContainer.querySelector('.green-card-inner');

            // 點擊整個卡片時反轉
            cardContainer.addEventListener('click', (e) => {
                // 如果點擊的是複選框、標籤或其容器，不執行反轉
                if (e.target.closest('.recycle-check-container') || 
                    e.target.closest('.switch') || 
                    e.target.closest('.slider')) {
                    return;
                }
                // 如果點擊的是標題區域，不在這裡處理
                if (e.target.closest('.member-header')) {
                    return;
                }
                // 切換卡片反轉狀態
                if (cardInner.style.transform === 'rotateY(180deg)') {
                    cardInner.style.transform = '';
                } else {
                    cardInner.style.transform = 'rotateY(180deg)';
                }
            });

            // 點擊卡片背面時反轉回正面
            cardBack.addEventListener('click', (e) => {
                // 防止事件冒泡到其他元素
                e.stopPropagation();
                // 如果點擊的是複選框、標籤或其容器，不執行反轉
                if (e.target.closest('.recycle-check-container') || 
                    e.target.closest('.switch') || 
                    e.target.closest('.slider')) {
                    return;
                }
                cardInner.style.transform = '';
            });

            // 點擊 header 時展開/收起內容
            header.addEventListener('click', (e) => {
                e.stopPropagation(); // 防止觸發卡片的點擊事件
                // 收起其他所有卡片
                this.cards.forEach(otherCard => {
                    if (otherCard !== cardContainer) {
                        const otherWrapper = otherCard.querySelector('.card-content-wrapper');
                        otherWrapper.classList.remove('expanded');
                        const otherInner = otherCard.querySelector('.green-card-inner');
                        otherInner.style.transform = '';
                        otherCard.classList.remove('expanded');
                    }
                });

                // 切換當前卡片
                contentWrapper.classList.toggle('expanded');
                cardContainer.classList.toggle('expanded');
                
                if (contentWrapper.classList.contains('expanded')) {
                    cardInner.style.transform = 'rotateY(180deg)';
                    // 確保展開的卡片可見
                    setTimeout(() => {
                        const cardRect = cardContainer.getBoundingClientRect();
                        const viewportHeight = window.innerHeight;
                        const cardBottom = cardRect.bottom;
                        
                        if (cardBottom > viewportHeight) {
                            const scrollAmount = cardBottom - viewportHeight + 20;
                            window.scrollBy({
                                top: scrollAmount,
                                behavior: 'smooth'
                            });
                        }
                    }, 300);
                } else {
                    cardInner.style.transform = '';
                }
            });

            recycleCheck.addEventListener('change', (e) => {
                e.stopPropagation(); // 防止觸發卡片的點擊事件
                this.updateCardStatus(recycleCheck.checked, alert, cardBack);
                this.saveCardStatus(index, recycleCheck.checked);
            });

            this.initializeCardStatus(index, recycleCheck, alert, cardBack);
        });
    }

    updateCardStatus(isChecked, alert, cardBack) {
        const header = alert.closest('.member-header');
        if (isChecked) {
            alert.textContent = '✅ 已完成廚餘回收';
            header.classList.add('completed');
            cardBack.classList.add('completed');
        } else {
            alert.textContent = '❌ 未完成廚餘回收';
            header.classList.remove('completed');
            cardBack.classList.remove('completed');
        }
    }

    saveCardStatus(index, status) {
        const today = new Date().toLocaleDateString();
        localStorage.setItem(`recycleStatus-${index}`, status);
        localStorage.setItem(`recycleDate-${index}`, today);
    }

    initializeCardStatus(index, recycleCheck, alert, cardBack) {
        const today = new Date().toLocaleDateString();
        const savedDate = localStorage.getItem(`recycleDate-${index}`);
        const savedStatus = localStorage.getItem(`recycleStatus-${index}`);

        if (savedDate !== today) {
            recycleCheck.checked = false;
            this.updateCardStatus(false, alert, cardBack);
            this.saveCardStatus(index, false);
        } else {
            const status = savedStatus === 'true';
            recycleCheck.checked = status;
            this.updateCardStatus(status, alert, cardBack);
        }
    }

    setupAutoReset() {
        const checkDate = () => {
            const today = new Date().toLocaleDateString();
            const lastResetDate = localStorage.getItem('lastResetDate');
            
            if (lastResetDate !== today) {
                this.resetAllCards();
                localStorage.setItem('lastResetDate', today);
            }
        };

        checkDate();
        setInterval(checkDate, 60000);
    }

    resetAllCards() {
        this.cards.forEach((cardContainer, index) => {
            const recycleCheck = cardContainer.querySelector(`#recycleCheck-${index}`);
            const alert = cardContainer.querySelector(`#alert-${index}`);
            const cardBack = cardContainer.querySelector('.green-card-back');
            
            recycleCheck.checked = false;
            this.updateCardStatus(false, alert, cardBack);
            this.saveCardStatus(index, false);
        });
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new CardSlider();
});