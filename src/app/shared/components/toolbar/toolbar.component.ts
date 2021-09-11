import { Component, Input, OnInit } from "@angular/core";

@Component({
    selector:'parking-toolbar',
    templateUrl: 'toolbar.component.html',
    styleUrls: ['toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
    @Input() headerTitle: string;
    @Input() letterStartTitle: string;

    ngOnInit(): void {
        
    }
}