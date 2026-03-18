'use client'

import React, { memo } from 'react'
import { cn } from '@/lib/utils'

export interface JimboPanelProps {
    children?: React.ReactNode
    className?: string
    style?: React.CSSProperties
    sway?: boolean
    onBack?: () => void
    backLabel?: string
    hideBack?: boolean
    onClick?: React.MouseEventHandler<HTMLDivElement>
    [key: string]: unknown
}

export const JimboPanel = memo(function JimboPanel({
    children, className, sway, onBack, backLabel, hideBack, style, ...props
}: JimboPanelProps) {
    return (
        <div
            className={cn('jimbo-panel relative flex flex-col', sway && 'animate-sway', className)}
            style={style}
            {...props as React.HTMLAttributes<HTMLDivElement>}
        >
            {!hideBack && onBack && (
                <button
                    onClick={onBack}
                    className="jimbo-btn jimbo-btn-back self-start mb-2 text-xs"
                >
                    ← {backLabel ?? 'Back'}
                </button>
            )}
            {children}
        </div>
    )
})

export interface JimboInnerPanelProps {
    children?: React.ReactNode
    className?: string
    style?: React.CSSProperties
    [key: string]: unknown
}

export const JimboInnerPanel = memo(function JimboInnerPanel({
    children, className, style, ...props
}: JimboInnerPanelProps) {
    return (
        <div
            className={cn('jimbo-inner-panel', className)}
            style={style}
            {...props as React.HTMLAttributes<HTMLDivElement>}
        >
            {children}
        </div>
    )
})

export type JimboButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'back' | 'red' | 'green'
export type JimboButtonSize = 'sm' | 'md' | 'lg'

export interface JimboButtonProps {
    children?: React.ReactNode
    variant?: JimboButtonVariant
    size?: JimboButtonSize
    fullWidth?: boolean
    className?: string
    style?: React.CSSProperties
    disabled?: boolean
    onClick?: () => void
    type?: 'button' | 'submit' | 'reset'
    [key: string]: unknown
}

const VARIANT_CLASS: Record<JimboButtonVariant, string> = {
    primary: 'jimbo-btn jimbo-btn-red',
    secondary: 'jimbo-btn jimbo-btn-blue',
    danger: 'jimbo-btn jimbo-btn-red',
    ghost: 'jimbo-btn jimbo-btn-ghost',
    back: 'jimbo-btn jimbo-btn-back',
    red: 'jimbo-btn jimbo-btn-red',
    green: 'jimbo-btn jimbo-btn-green',
}

export const JimboButton = memo(function JimboButton({
    children, variant = 'primary', size, fullWidth, className, style, disabled, onClick, type = 'button', ...props
}: JimboButtonProps) {
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={cn(
                VARIANT_CLASS[variant],
                size === 'sm' && 'text-xs px-2 py-1',
                size === 'lg' && 'text-base px-6 py-3',
                fullWidth && 'w-full',
                disabled && 'opacity-50 cursor-not-allowed',
                className,
            )}
            style={style}
            {...props as React.ButtonHTMLAttributes<HTMLButtonElement>}
        >
            {children}
        </button>
    )
})

export const JimboBackButton = memo(function JimboBackButton({
    children, className, ...props
}: JimboButtonProps) {
    return (
        <JimboButton variant="back" className={cn('self-start', className)} {...props}>
            {children ?? '← Back'}
        </JimboButton>
    )
})

export interface JimboInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    className?: string
}

export const JimboInput = memo(function JimboInput({ label, className, ...props }: JimboInputProps) {
    return (
        <div className="flex flex-col gap-1">
            {label && <label className="text-xs text-white/50 font-pixel uppercase">{label}</label>}
            <input
                className={cn(
                    'bg-[#111] border border-[var(--jimbo-panel-edge)] text-white text-sm px-3 py-2 rounded-sm',
                    'focus:outline-none focus:border-[var(--jimbo-blue)] placeholder:text-white/20',
                    className,
                )}
                {...props}
            />
        </div>
    )
})

export interface JimboTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    className?: string
}

export const JimboTextArea = memo(function JimboTextArea({ label, className, ...props }: JimboTextAreaProps) {
    return (
        <div className="flex flex-col gap-1">
            {label && <label className="text-xs text-white/50 font-pixel uppercase">{label}</label>}
            <textarea
                className={cn(
                    'bg-[#111] border border-[var(--jimbo-panel-edge)] text-white text-sm px-3 py-2 rounded-sm resize-y',
                    'focus:outline-none focus:border-[var(--jimbo-blue)] placeholder:text-white/20',
                    className,
                )}
                {...props}
            />
        </div>
    )
})

export default JimboPanel
