import React from 'react'
import { Card, CardContent, CardHeader } from './ui/card'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function MetricCard({ title, value, icon: Icon, description, trend, trendDirection = 'up' }) {
  return (
    <Card className="overflow-hidden relative group">
      {/* Top hover highlight bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-lg bg-secondary text-muted-foreground group-hover:text-primary transition-colors">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="text-2xl font-bold tracking-tight mb-1 flex items-baseline gap-2">
          {value}
          {trend && (
            <span className={`text-[10px] font-semibold flex items-center ${
              trendDirection === 'up' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {trendDirection === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {trend}
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground leading-none">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
