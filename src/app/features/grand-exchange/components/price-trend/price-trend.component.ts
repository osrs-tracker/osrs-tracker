import { Component, ElementRef, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { Chart, ChartDataSets } from 'chart.js';
import { forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ItemDetailModel } from 'src/app/services/item/item.model';
import { ItemService } from 'src/app/services/item/item.service';

@Component({
  selector: 'price-trend',
  templateUrl: 'price-trend.component.html',
  styleUrls: ['./price-trend.component.scss'],
})
export class PriceTrendComponent implements OnInit {
  @ViewChild('priceTrendCanvas', { static: true }) priceTrendCanvas!: ElementRef<HTMLCanvasElement>;
  priceTrendChart?: Chart;

  @Input() ids!: number[];
  items: ItemDetailModel[] = [ItemDetailModel.empty()];

  lines: { t: string; y: number }[][] = [];
  period = 90;
  loading = false;

  constructor(private itemService: ItemService, private ngZone: NgZone) { }

  ngOnInit(): void {
    this.createLineWithLineChartType();
    this.loading = true;
    forkJoin([this.getItemDetails(), this.getData()]).subscribe(() => {
      this.loading = false;
      this.setupChart();
      this.updateData(90);
    });
  }

  getItemDetails(): Observable<ItemDetailModel[]> {
    return forkJoin(this.ids.map(id => this.itemService.itemDetails(id))).pipe(tap(items => (this.items = items)));
  }

  getData(): Observable<any> {
    return forkJoin(this.ids.map(id => this.itemService.itemGraph(id))).pipe(
      map((responses: { daily: any }[]) =>
        responses.map(response =>
          Object.keys(response.daily).map((time: string) => ({
            t: new Date(Number(time)).toISOString(),
            y: Number(response.daily[time]),
          }))
        )
      ),
      tap(lines => (this.lines = lines))
    );
  }

  updateData(period: number): void {
    this.ngZone.runOutsideAngular(() => {
      if (!this.priceTrendChart) { return; }

      this.period = period;
      Object.assign(this.priceTrendChart.config!.options!.scales!.xAxes![0].time, {
        unit: period === 30 ? 'week' : 'month',
        stepSize: period === 180 ? 2 : 1,
      });

      const colors = ['#453b30', '#60564b'];

      this.priceTrendChart.data.datasets = this.lines.map(
        (data, index) => ({
          label: this.items[index].name,
          backgroundColor: 'rgba(78,67,55,0.25)',
          borderColor: colors[index],
          borderWidth: 2,
          pointBackgroundColor: colors[index],
          pointRadius: 0,
          pointHitRadius: 0,
          data: data.slice(180 - period, 180),
          cubicInterpolationMode: 'monotone',
          borderDash: index > 0 ? [10, 2] : [],
        } as ChartDataSets));

      this.priceTrendChart.update({ duration: 600 });
    });
  }

  private setupChart(): void {
    this.ngZone.runOutsideAngular(() => {
      this.priceTrendChart = new Chart(this.priceTrendCanvas.nativeElement, {
        type: 'lineWithLine',
        options: {
          responsive: true,
          legend: {
            display: this.items.length > 1,
            labels: {
              fontColor: '#222',
            },
            position: 'bottom',
          },
          hover: {
            mode: 'nearest',
            intersect: true,
          },
          tooltips: {
            intersect: false,
            mode: 'index',
            position: 'nearest',
            displayColors: false,
            backgroundColor: '#000000aa ',
            callbacks: {
              title: tooltipItems =>
                new Date(tooltipItems[0].xLabel!).toLocaleDateString('en-us', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }),
              label: tooltipItem => {
                const value = `${tooltipItem.yLabel}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                const itemName = this.items[tooltipItem.datasetIndex!].name;
                return `${itemName}: ${value} gp`;
              },
            },
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  fontColor: '#222',
                  callback: label => this.formatNumber(label, 1),
                },
              },
            ],
            xAxes: [
              {
                type: 'time',
                distribution: 'linear',
                ticks: {
                  fontColor: '#222',
                },
                time: {
                  displayFormats: {
                    week: 'MMM D',
                    month: 'MMM YYYY',
                  },
                },
              },
            ],
          },
        },
      });
    });
  }

  private formatNumber(num: number, digits: number): string {
    const si = [
      { value: 1, symbol: '' },
      { value: 1e3, symbol: 'k' },
      { value: 1e6, symbol: 'm' },
      { value: 1e9, symbol: 'b' },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i;
    for (i = si.length - 1; i > 0; i--) {
      if (num >= si[i].value) {
        break;
      }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol;
  }

  private createLineWithLineChartType(): void {
    Chart.defaults.lineWithLine = Chart.defaults.line;
    Chart.controllers.lineWithLine = Chart.controllers.line.extend({
      draw(ease: any): any {
        Chart.controllers.line.prototype.draw.call(this, ease);

        if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
          const activePoint = this.chart.tooltip._active[0];
          const ctx = this.chart.ctx;
          const x = activePoint.tooltipPosition().x;
          const topY = this.chart.scales['y-axis-0'].top;
          const bottomY = this.chart.scales['y-axis-0'].bottom;

          // draw line
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x, topY);
          ctx.lineTo(x, bottomY);
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#4e433788';
          ctx.stroke();
          ctx.restore();
        }
      },
    });
  }
}
