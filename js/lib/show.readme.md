<< Place this html in the body tag (before the body closes) >>

<div class="w5_toast" id="w5_toast"></div>
<div class="w5_glass" id="w5_glass"><ul><li><div></div><span>Aguarde ...</span></li></ul></div>

<< Copy this style to your project's css file >>

<style>
    .w5_toast {
        position: fixed;
        z-index: 10000;
        left: 20px;
        width: calc(100% - 40px);
        margin: 0;
        text-align: center;
        top: 64px;
        padding: 0;
    }
    .w5_toast div {
        margin: 10px auto;
        padding: 15px 20px;
        opacity: 0;
        margin-top: -50px;
        transition: 0.2s;
        transform: rotate(45deg);
        transform-origin: right;
        background: #000;
        color: #fff;
        text-align: left;
        width: fit-content;
        max-width: 300px;
        cursor: pointer;
        font-size: 1.2rem !important;
        font-weight: initial !important;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
    }
    .w5_toast div i {
        padding: 0;
        height: 1.5rem;
        line-height: 1.6rem;
        text-align: center;
        width: 1.6rem;
        float: right;
        margin: -1px -10px 0 0;
        font-size: 1.3rem;
        margin: -1.1rem -1.4rem 0 0;
        background: #ff0000;
        color: #ffffff;
    }
    .w5_toast div.active {
        opacity: 1;
        margin-top: 48px;
        transform: none;
    }
    .info {
        background-color: #0d47a1 !important;
    }
    .alert {
        background-color: #c62828 !important;
    }
    .warn {
        background-color: #ef6c00 !important;
    }
    .w5_glass {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        background: rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .w5_glass ul {
        max-height: 70vh;
        overflow-y: auto;
        text-align: center;
    }
    .w5_glass li {
        padding: 1rem;
        background: #f84040;
        text-align: left;
        margin: 0 auto;
        width: fit-content;
        color: #ffffff;
        display: flex;
        align-items: center;
    }

    .w5_glass li div {
        margin: 0 1rem 0 0;
        border: 2px solid #f3f3f3;
        border-radius: 50%;
        border-top: 2px solid #f84040;
        width: 1rem;
        height: 1rem;
        -webkit-animation: spin 0.5s linear infinite;
        animation: spin 0.5s linear infinite;
    }

    /* Safari */
    @-webkit-keyframes spin {
        0% {
            -webkit-transform: rotate(0deg);
        }
        100% {
            -webkit-transform: rotate(360deg);
        }
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
