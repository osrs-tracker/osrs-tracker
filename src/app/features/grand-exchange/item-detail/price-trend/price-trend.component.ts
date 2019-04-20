import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { forkJoin } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';
import { ItemProvider } from 'services/item/item';
import { ItemDetailModel } from 'services/item/item.model';

@Component({
  selector: 'price-trend',
  templateUrl: 'price-trend.component.html',
  styleUrls: ['./price-trend.component.scss'],
})
export class PriceTrendComponent implements OnInit {
  @ViewChild('priceTrendCanvas') priceTrendCanvas: ElementRef<HTMLCanvasElement>;
  priceTrendChart: Chart;

  @Input() id: number;
  item: ItemDetailModel = ItemDetailModel.empty();

  data: { t; y }[];
  period = 90;
  loading = false;

  constructor(private itemService: ItemProvider) {}

  ngOnInit() {
    this.loading = true;
    forkJoin(this.getItemDetails(), this.getData())
      .pipe(
        finalize(() => {
          this.loading = false;
          this.setupChart();
          this.updateData(90);
        })
      )
      .subscribe();
  }

  getItemDetails() {
    return this.itemService.itemDetails(this.id).pipe(tap(item => (this.item = item)));
  }

  getData() {
    return this.itemService.itemGraph(this.id).pipe(
      map((response: { daily: any }) =>
        Object.keys(response.daily).map((time: string) => ({
          t: new Date(+time).toISOString(),
          y: +response.daily[time],
        }))
      ),
      tap(response => (this.data = response))
    );
  }

  updateData(period: number) {
    this.period = period;
    Object.assign(this.priceTrendChart.config.options.scales.xAxes[0].time, {
      unit: period === 30 ? 'week' : 'month',
      stepSize: period === 180 ? 2 : 1,
    });

    this.priceTrendChart.data.datasets = [
      {
        backgroundColor: 'rgba(78,67,55,0.25)',
        borderColor: '#4E4337',
        borderWidth: 2,
        pointBackgroundColor: '#4E4337',
        pointRadius: 0,
        pointHitRadius: 5,
        data: this.data.slice(180 - period, 180),
        cubicInterpolationMode: 'monotone',
      },
    ];

    this.priceTrendChart.update({
      duration: 600,
    });
  }

  private setupChart(): void {
    this.priceTrendChart = new Chart(this.priceTrendCanvas.nativeElement, {
      type: 'line',
      options: {
        responsive: true,
        legend: {
          display: false,
        },
        tooltips: {
          displayColors: false,
          position: 'nearest',
          callbacks: {
            title: (tooltipItems, data) =>
              new Date(tooltipItems[0].xLabel).toLocaleDateString('en-us', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }),
            label: (tooltipItem, data) => `${tooltipItem.yLabel}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
          },
        },
        scales: {
          yAxes: [
            {
              ticks: {
                fontColor: '#333',
                callback: label => this.formatNumber(label, 1),
              },
            },
          ],
          xAxes: [
            {
              type: 'time',
              distribution: 'linear',
              ticks: {
                fontColor: '#333',
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
  }

  private formatNumber(num, digits) {
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
}
