<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up()
{
    Schema::table('jobs', function (Blueprint $table) {
        $table->string('category_name')->nullable()->after('title'); // adjust position if needed
    });
}

public function down()
{
    Schema::table('jobs', function (Blueprint $table) {
        $table->dropColumn('category_name');
    });
}
};
