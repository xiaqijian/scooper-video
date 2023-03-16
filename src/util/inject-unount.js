/**
 * @file 组件卸载执行
 * @author chenlin
 * @date 2019/10/15
 * @version:v1.1.0
 */

export function injectUnount (target){
    // 改装componentWillUnmount，销毁的时候记录一下
    let next = target.prototype.componentWillUnmount
    target.prototype.componentWillUnmount = function (...params) {
        if (next) next.apply(this, params);
        this.unmount = true
    }
    // 对setState的改装，setState查看目前是否已经销毁
    let setState = target.prototype.setState
    target.prototype.setState = function (...params) {
        if ( this.unmount ) return;
        setState.apply(this, params)
    }
}